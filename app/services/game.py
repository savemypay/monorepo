from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from jose import jwt
from sqlalchemy.orm import Session

from app.core.config import GAME_ACCESS_TOKEN_EXPIRE_DAYS, JWT_ALGORITHM, JWT_SECRET_KEY
from app.entities.game_score import GameScore
from app.entities.game_user import GameUser
from app.utils.response import error_response


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _create_game_access_token(user: GameUser) -> tuple[str, int]:
    expires_delta = timedelta(days=GAME_ACCESS_TOKEN_EXPIRE_DAYS)
    expire_at = _now() + expires_delta
    payload = {
        "sub": str(user.id),
        "user_id": str(user.id),
        "role": "game_user",
        "wallet_id": user.wallet_id,
        "exp": expire_at,
    }
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token, int(expires_delta.total_seconds())


def register_game_user(db: Session, wallet_id: str) -> dict:
    wallet_id = wallet_id.strip()
    if not wallet_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response(message="wallet_id is required", code="validation_error"),
        )

    user = db.query(GameUser).filter(GameUser.wallet_id == wallet_id).first()
    is_new_user = False
    if not user:
        user = GameUser(wallet_id=wallet_id, is_active=True, created_by="game")
        db.add(user)
        db.commit()
        db.refresh(user)
        is_new_user = True

    token, expires_in = _create_game_access_token(user)
    return {
        "access_token": token,
        "token_type": "bearer",
        "access_token_expires_in": expires_in,
        "role": "game_user",
        "user_id": str(user.id),
        "wallet_id": user.wallet_id,
        "is_new_user": is_new_user,
    }


def submit_game_score(db: Session, user_id: int, score: int) -> dict:
    user = db.query(GameUser).filter(GameUser.id == user_id, GameUser.is_active.is_(True)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_response(message="Game user not found", code="game_user_not_found"),
        )

    now = _now()
    score_row = GameScore(user_id=user.id, score=score, achieved_at=now, created_by="game")
    db.add(score_row)

    updated_best = False
    if user.best_score is None or score > user.best_score:
        user.best_score = score
        user.best_score_achieved_at = now
        updated_best = True
    elif user.best_score == score and user.best_score_achieved_at is None:
        user.best_score_achieved_at = now

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "user_id": user.id,
        "wallet_id": user.wallet_id,
        "submitted_score": score,
        "best_score": user.best_score or 0,
        "best_score_achieved_at": user.best_score_achieved_at,
        "updated_best": updated_best,
    }


def get_leaderboard(db: Session, limit: int = 20) -> list[dict]:
    users = (
        db.query(GameUser)
        .filter(
            GameUser.is_active.is_(True),
            GameUser.best_score.isnot(None),
            GameUser.best_score_achieved_at.isnot(None),
        )
        .order_by(
            GameUser.best_score.desc(),
            GameUser.best_score_achieved_at.asc(),
            GameUser.id.asc(),
        )
        .limit(limit)
        .all()
    )

    return [
        {
            "rank": idx + 1,
            "user_id": user.id,
            "wallet_id": user.wallet_id,
            "best_score": int(user.best_score or 0),
            "best_score_achieved_at": user.best_score_achieved_at,
        }
        for idx, user in enumerate(users)
    ]
