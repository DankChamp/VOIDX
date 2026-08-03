from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="member")
    chat_allowed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=_utcnow)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content_sanitized = Column(Text, nullable=False)
    created_at = Column(DateTime, default=_utcnow)

    user = relationship("User", lazy="joined")


class ForumThread(Base):
    __tablename__ = "forum_threads"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    content_sanitized = Column(Text, nullable=False)
    is_locked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=_utcnow)

    user = relationship("User", lazy="joined")
    replies = relationship("ForumReply", back_populates="thread", lazy="selectin",
                           order_by="ForumReply.created_at", cascade="all, delete-orphan")


class ForumReply(Base):
    __tablename__ = "forum_replies"

    id = Column(Integer, primary_key=True)
    thread_id = Column(Integer, ForeignKey("forum_threads.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content_sanitized = Column(Text, nullable=False)
    created_at = Column(DateTime, default=_utcnow)

    user = relationship("User", lazy="joined")
    thread = relationship("ForumThread", back_populates="replies")


class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    user = relationship("User", lazy="joined")


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=_utcnow)

    user = relationship("User", lazy="joined")
