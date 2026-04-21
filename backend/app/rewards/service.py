from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from typing import Any

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.entities.reward_account import RewardAccount
from app.entities.reward_transaction import RewardTransaction
from app.entities.reward_user_state import RewardUserState
from app.entities.user import User


@dataclass(slots=True)
class RewardGrantResult:
    transaction: RewardTransaction
    account: RewardAccount
    created: bool


@dataclass(slots=True)
class DailyLoginRewardResult:
    rewarded: bool
    points: int
    current_streak: int
    longest_streak: int
    reward_result: RewardGrantResult | None = None


class RewardService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_or_create_account(self, *, user_id: int, created_by: str = "reward_system") -> RewardAccount:
        account = (
            self.db.query(RewardAccount)
            .filter(RewardAccount.user_id == user_id)
            .with_for_update(of=RewardAccount)
            .first()
        )
        if account is not None:
            return account

        user = self.db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise ValueError(f"User not found: {user_id}")

        # Seed the rewards account from the legacy referral_points balance so
        # existing users can transition without losing previously earned rewards.
        starting_balance = int(user.referral_points or 0)
        account = RewardAccount(
            user_id=user_id,
            current_balance=starting_balance,
            lifetime_earned=starting_balance,
            lifetime_redeemed=0,
            created_by=created_by,
            updated_by=created_by,
        )
        try:
            self.db.add(account)
            self.db.flush()
            return account
        except IntegrityError:
            # Another transaction created the account first; reuse it.
            self.db.rollback()
            account = (
                self.db.query(RewardAccount)
                .filter(RewardAccount.user_id == user_id)
                .with_for_update(of=RewardAccount)
                .first()
            )
            if account is None:
                raise
            return account

    def grant_reward(
        self,
        *,
        user_id: int,
        event_type: str,
        source_type: str,
        source_id: str | int,
        points: int,
        metadata: dict[str, Any] | None = None,
        created_by: str = "reward_system",
        auto_commit: bool = True,
    ) -> RewardGrantResult:
        if user_id <= 0:
            raise ValueError("user_id must be > 0")
        if points <= 0:
            raise ValueError("points must be > 0")

        event_type = event_type.strip().lower()
        source_type = source_type.strip().lower()
        source_id_str = str(source_id).strip()
        if not event_type:
            raise ValueError("event_type is required")
        if not source_type:
            raise ValueError("source_type is required")
        if not source_id_str:
            raise ValueError("source_id is required")

        def _find_existing_transaction() -> RewardTransaction | None:
            return (
                self.db.query(RewardTransaction)
                .filter(
                    RewardTransaction.user_id == user_id,
                    RewardTransaction.event_type == event_type,
                    RewardTransaction.source_type == source_type,
                    RewardTransaction.source_id == source_id_str,
                )
                .first()
            )

        transaction = _find_existing_transaction()
        if transaction is not None:
            account = self.get_or_create_account(user_id=user_id, created_by=created_by)
            return RewardGrantResult(transaction=transaction, account=account, created=False)

        try:
            account = self.get_or_create_account(user_id=user_id, created_by=created_by)
            account.current_balance = int(account.current_balance or 0) + points
            account.lifetime_earned = int(account.lifetime_earned or 0) + points
            account.updated_by = created_by

            transaction = RewardTransaction(
                user_id=user_id,
                event_type=event_type,
                source_type=source_type,
                source_id=source_id_str,
                points=points,
                status="credited",
                metadata_json=json.dumps(metadata or {}),
                created_by=created_by,
                updated_by=created_by,
            )
            self.db.add(account)
            self.db.add(transaction)

            # Maintain the legacy field until API responses and callers are migrated
            # to a rewards-specific balance field.
            user = self.db.query(User).filter(User.id == user_id).first()
            if user is not None:
                user.referral_points = int(account.current_balance or 0)
                user.updated_by = created_by
                self.db.add(user)

            if auto_commit:
                self.db.commit()
                self.db.refresh(account)
                self.db.refresh(transaction)
            else:
                self.db.flush()
            return RewardGrantResult(transaction=transaction, account=account, created=True)
        except IntegrityError:
            # Either the account or the transaction unique constraint was hit by a concurrent request.
            self.db.rollback()
            transaction = _find_existing_transaction()
            if transaction is None:
                # if the transaction is still missing, re-raise so caller sees the real error
                raise
            account = self.get_or_create_account(user_id=user_id, created_by=created_by)
            return RewardGrantResult(transaction=transaction, account=account, created=False)

    def grant_daily_login_reward(
        self,
        *,
        user_id: int,
        points: int,
        occurred_at: datetime | None = None,
        created_by: str = "daily_login_reward",
    ) -> DailyLoginRewardResult:
        if points <= 0:
            raise ValueError("points must be > 0")

        user = self.db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise ValueError(f"User not found: {user_id}")
        if user.role != "customer":
            return DailyLoginRewardResult(
                rewarded=False,
                points=0,
                current_streak=0,
                longest_streak=0,
            )

        occurred_at = occurred_at or datetime.now(timezone.utc)
        today = occurred_at.date()
        state_key = "daily_login"
        state_row = self.get_state(user_id=user_id, state_key=state_key)
        state = self._decode_state(state_row.state_json if state_row else None)

        last_login_date = self._parse_iso_date(state.get("last_login_date"))
        current_streak = int(state.get("current_streak") or 0)
        longest_streak = int(state.get("longest_streak") or 0)

        if last_login_date == today:
            return DailyLoginRewardResult(
                rewarded=False,
                points=0,
                current_streak=current_streak,
                longest_streak=longest_streak,
            )

        if last_login_date == (today - timedelta(days=1)):
            current_streak += 1
        else:
            current_streak = 1

        longest_streak = max(longest_streak, current_streak)
        reward_result = self.grant_reward(
            user_id=user_id,
            event_type="daily_login",
            source_type="login_date",
            source_id=today.isoformat(),
            points=points,
            metadata={
                "reward_date": today.isoformat(),
                "current_streak": current_streak,
                "longest_streak": longest_streak,
            },
            created_by=created_by,
            auto_commit=False,
        )

        if reward_result.created:
            self.upsert_state(
                user_id=user_id,
                state_key=state_key,
                state={
                    "last_login_date": today.isoformat(),
                    "current_streak": current_streak,
                    "longest_streak": longest_streak,
                },
                created_by=created_by,
                auto_commit=False,
            )
            self.db.commit()
            self.db.refresh(reward_result.account)
            self.db.refresh(reward_result.transaction)

        return DailyLoginRewardResult(
            rewarded=reward_result.created,
            points=reward_result.transaction.points if reward_result.created else 0,
            current_streak=current_streak,
            longest_streak=longest_streak,
            reward_result=reward_result,
        )

    def get_state(self, *, user_id: int, state_key: str) -> RewardUserState | None:
        state_key = state_key.strip().lower()
        return (
            self.db.query(RewardUserState)
            .filter(
                RewardUserState.user_id == user_id,
                RewardUserState.state_key == state_key,
            )
            .first()
        )

    def upsert_state(
        self,
        *,
        user_id: int,
        state_key: str,
        state: dict[str, Any],
        created_by: str = "reward_system",
        auto_commit: bool = True,
    ) -> RewardUserState:
        state_key = state_key.strip().lower()
        if user_id <= 0:
            raise ValueError("user_id must be > 0")
        if not state_key:
            raise ValueError("state_key is required")

        row = self.get_state(user_id=user_id, state_key=state_key)
        if row is None:
            row = RewardUserState(
                user_id=user_id,
                state_key=state_key,
                created_by=created_by,
            )

        row.state_json = json.dumps(state or {})
        row.updated_by = created_by
        self.db.add(row)
        if auto_commit:
            self.db.commit()
            self.db.refresh(row)
        else:
            self.db.flush()
        return row

    @staticmethod
    def _decode_state(value: str | None) -> dict[str, Any]:
        if not value:
            return {}
        try:
            decoded = json.loads(value)
        except json.JSONDecodeError:
            return {}
        return decoded if isinstance(decoded, dict) else {}

    @staticmethod
    def _parse_iso_date(value: Any) -> date | None:
        if not value or not isinstance(value, str):
            return None
        try:
            return date.fromisoformat(value)
        except ValueError:
            return None
