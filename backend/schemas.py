from datetime import datetime
from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class LoginRequest(BaseModel):
    username: str
    password: str


class UserCreate(BaseModel):
    username: str
    password: str
    chat_allowed: bool = False


class UserUpdate(BaseModel):
    chat_allowed: bool | None = None


class UserOut(BaseModel):
    id: int
    username: str
    role: str
    chat_allowed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMessageOut(BaseModel):
    id: int
    user_id: int
    username: str
    content_sanitized: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSend(BaseModel):
    content: str


class ForumThreadOut(BaseModel):
    id: int
    user_id: int
    username: str
    title: str
    content_sanitized: str
    is_locked: bool
    created_at: datetime
    reply_count: int = 0

    class Config:
        from_attributes = True


class ForumThreadCreate(BaseModel):
    title: str
    content: str


class ForumThreadDetail(BaseModel):
    id: int
    user_id: int
    username: str
    title: str
    content_sanitized: str
    is_locked: bool
    created_at: datetime
    replies: list["ForumReplyOut"]

    class Config:
        from_attributes = True


class ForumReplyOut(BaseModel):
    id: int
    thread_id: int
    user_id: int
    username: str
    content_sanitized: str
    created_at: datetime

    class Config:
        from_attributes = True


class ForumReplyCreate(BaseModel):
    content: str


class PlanOut(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    updated_at: datetime
    author: str

    class Config:
        from_attributes = True


class PlanCreate(BaseModel):
    title: str
    content: str


class AnnouncementOut(BaseModel):
    id: int
    title: str
    content: str
    is_pinned: bool
    created_at: datetime
    author: str

    class Config:
        from_attributes = True


class AnnouncementCreate(BaseModel):
    title: str
    content: str
    is_pinned: bool = False


class DashboardOut(BaseModel):
    member_count: int
    announcement_count: int
    plan_count: int
    unread_count: int = 0
