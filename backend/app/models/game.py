from datetime import datetime

from pydantic import BaseModel, Field, conint

from app.models.auth import ApiResponse


class GameRegisterRequest(BaseModel):
    wallet_id: str = Field(..., min_length=10, max_length=255)
    message: str = Field(..., min_length=1, max_length=5000)
    signature: str = Field(..., min_length=10, max_length=1000)


class GameRegisterData(BaseModel):
    access_token: str
    token_type: str
    access_token_expires_in: int
    role: str
    user_id: str
    wallet_id: str
    is_new_user: bool


class GameRegisterResponse(ApiResponse[GameRegisterData]):
    pass


class GameScoreSubmitRequest(BaseModel):
    score: conint(ge=0)


class GameScoreSubmitData(BaseModel):
    user_id: int
    wallet_id: str
    submitted_score: int
    best_score: int
    best_score_achieved_at: datetime
    updated_best: bool


class GameScoreSubmitResponse(ApiResponse[GameScoreSubmitData]):
    pass


class GameLeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    wallet_id: str
    best_score: int
    best_score_achieved_at: datetime


class GameLeaderboardResponse(ApiResponse[GameLeaderboardEntry]):
    pass
