import logging

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.api.security import get_current_game_user
from app.models.game import (
    GameLeaderboardResponse,
    GameRegisterRequest,
    GameRegisterResponse,
    GameScoreSubmitRequest,
    GameScoreSubmitResponse,
)
from app.services.game import get_leaderboard, register_game_user, submit_game_score
from app.utils.response import success_response

router = APIRouter(prefix="/game", tags=["game"])
logger = logging.getLogger(__name__)


@router.post("/register", status_code=status.HTTP_200_OK, response_model=GameRegisterResponse)
def register(
    payload: GameRegisterRequest,
    db: Session = Depends(get_db),
):
    data = register_game_user(
        db,
        wallet_id=payload.wallet_id,
        message=payload.message,
        signature=payload.signature,
    )
    return success_response(message="Game user registered", data=[data])


@router.post("/score", status_code=status.HTTP_200_OK, response_model=GameScoreSubmitResponse)
def submit_score(
    payload: GameScoreSubmitRequest,
    db: Session = Depends(get_db),
    actor: dict = Depends(get_current_game_user),
):
    user_id = int(actor.get("user_id") or actor.get("sub"))
    data = submit_game_score(db, user_id=user_id, score=payload.score)
    return success_response(message="Score submitted", data=[data])


@router.get("/leaderboard", status_code=status.HTTP_200_OK, response_model=GameLeaderboardResponse)
def leaderboard(
    db: Session = Depends(get_db),
    actor: dict = Depends(get_current_game_user),
):
    _ = actor  # enforce auth
    entries = get_leaderboard(db, limit=20)
    return success_response(message="Leaderboard fetched", data=entries)
