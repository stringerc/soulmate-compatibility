"""
Database models for B2B monetization
Using SQLAlchemy for ORM
"""

from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON, ARRAY, CheckConstraint, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

Base = declarative_base()


class Partner(Base):
    """Partner/Client model"""
    __tablename__ = "partners"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    tier = Column(String(50), nullable=False, default="starter")  # starter, professional, enterprise, research
    status = Column(String(50), nullable=False, default="active")  # active, suspended, cancelled, trial
    ip_whitelist = Column(ARRAY(String), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    api_keys = relationship("APIKey", back_populates="partner", cascade="all, delete-orphan")
    api_usage = relationship("APIUsage", back_populates="partner")
    events = relationship("Event", back_populates="partner")
    subscriptions = relationship("PartnerSubscription", back_populates="partner")
    
    __table_args__ = (
        CheckConstraint("tier IN ('starter', 'professional', 'enterprise', 'research')", name="valid_tier"),
        CheckConstraint("status IN ('active', 'suspended', 'cancelled', 'trial')", name="valid_status"),
    )


class APIKey(Base):
    """API Key model"""
    __tablename__ = "api_keys"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partner_id = Column(UUID(as_uuid=True), ForeignKey("partners.id", ondelete="CASCADE"), nullable=False)
    key_hash = Column(String(64), unique=True, nullable=False)  # SHA-256 hash
    name = Column(String(255), nullable=False)
    last_used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    revoked_at = Column(DateTime, nullable=True)
    
    # Relationships
    partner = relationship("Partner", back_populates="api_keys")
    usage = relationship("APIUsage", back_populates="api_key")


class APIUsage(Base):
    """API Usage tracking model"""
    __tablename__ = "api_usage"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partner_id = Column(UUID(as_uuid=True), ForeignKey("partners.id", ondelete="CASCADE"), nullable=False)
    api_key_id = Column(UUID(as_uuid=True), ForeignKey("api_keys.id", ondelete="SET NULL"), nullable=True)
    endpoint = Column(String(255), nullable=False)
    method = Column(String(10), nullable=False)
    response_time = Column(Integer, nullable=True)  # milliseconds
    status_code = Column(Integer, nullable=False)
    request_size = Column(Integer, nullable=True)  # bytes
    response_size = Column(Integer, nullable=True)  # bytes
    timestamp = Column(DateTime, server_default=func.now())
    request_metadata = Column(JSONB, nullable=True)  # IP, user agent, etc. (renamed from 'metadata' to avoid SQLAlchemy conflict)
    
    # Relationships
    partner = relationship("Partner", back_populates="api_usage")
    api_key = relationship("APIKey", back_populates="usage")
    
    __table_args__ = (
        CheckConstraint("method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')", name="valid_method"),
    )


class Event(Base):
    """Event model for event sponsorship"""
    __tablename__ = "events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partner_id = Column(UUID(as_uuid=True), ForeignKey("partners.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    event_date = Column(DateTime, nullable=True)
    location = Column(String(255), nullable=True)
    attendee_count = Column(Integer, default=0)
    matched = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    partner = relationship("Partner", back_populates="events")
    matches = relationship("EventMatch", back_populates="event", cascade="all, delete-orphan")


class EventMatch(Base):
    """Event match model"""
    __tablename__ = "event_matches"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    attendee1_id = Column(String(255), nullable=False)
    attendee2_id = Column(String(255), nullable=False)
    compatibility_score = Column(Float, nullable=False)
    dimension_breakdown = Column(JSONB, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    event = relationship("Event", back_populates="matches")
    
    __table_args__ = (
        CheckConstraint("compatibility_score >= 0 AND compatibility_score <= 1", name="valid_score"),
        UniqueConstraint("event_id", "attendee1_id", "attendee2_id", name="unique_match"),
    )


class PartnerSubscription(Base):
    """Partner subscription/billing model"""
    __tablename__ = "partner_subscriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partner_id = Column(UUID(as_uuid=True), ForeignKey("partners.id", ondelete="CASCADE"), nullable=False)
    stripe_subscription_id = Column(String(255), unique=True, nullable=True)
    plan_type = Column(String(50), nullable=False)  # api, event, research, corporate, enterprise
    status = Column(String(50), nullable=False, default="active")
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    partner = relationship("Partner", back_populates="subscriptions")
    
    __table_args__ = (
        CheckConstraint("plan_type IN ('api', 'event', 'research', 'corporate', 'enterprise')", name="valid_plan"),
    )


class AnonymizedResult(Base):
    """Anonymized compatibility results for research"""
    __tablename__ = "anonymized_results"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    compatibility_score = Column(Float, nullable=False)
    trait_compatibility = Column(Float, nullable=True)
    resonance_compatibility = Column(Float, nullable=True)
    dimension_breakdown = Column(JSONB, nullable=True)
    demographics = Column(JSONB, nullable=True)  # age_range, region, etc. (no PII)
    created_at = Column(DateTime, server_default=func.now())
    anonymized_at = Column(DateTime, server_default=func.now())
    
    __table_args__ = (
        CheckConstraint("compatibility_score >= 0 AND compatibility_score <= 1", name="valid_score"),
    )

