"""
Soulmates Domain Models
SQLAlchemy models for soulmates features (self-discovery, compatibility, relationships)
"""

from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON, ARRAY, CheckConstraint, UniqueConstraint, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

# Reuse existing Base from models.py
from database.models import Base


# Enums
class BondStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    ENDED = "ENDED"


class BondType(str, enum.Enum):
    ROMANTIC = "ROMANTIC"
    FRIEND = "FRIEND"
    SELF_EXPERIMENT = "SELF_EXPERIMENT"


class BondVisibility(str, enum.Enum):
    PRIVATE = "PRIVATE"
    SHARED = "SHARED"
    ANONYMIZED = "ANONYMIZED"


class BondInviteStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"
    EXPIRED = "EXPIRED"


class SoulJourneyEntryType(str, enum.Enum):
    SELF_REFLECTION = "SELF_REFLECTION"
    CONFLICT = "CONFLICT"
    WIN = "WIN"
    CHECKIN = "CHECKIN"
    PROMPT_RESPONSE = "PROMPT_RESPONSE"


class SoulmatesPlanTier(str, enum.Enum):
    FREE = "FREE"
    PLUS = "PLUS"
    COUPLE_PREMIUM = "COUPLE_PREMIUM"


class OrgRole(str, enum.Enum):
    OWNER = "OWNER"
    ADMIN = "ADMIN"
    COACH = "COACH"
    MEMBER = "MEMBER"


# User model (assumed to exist in syncscript.app - we'll reference it)
# For now, we'll create a minimal User reference
# In production, this should reference the actual User table from syncscript

class User(Base):
    """User model - references syncscript.app user"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    soul_profile = relationship("SoulProfile", back_populates="user", uselist=False)
    bonds_as_a = relationship("RelationshipBond", foreign_keys="RelationshipBond.userAId", back_populates="userA")
    bonds_as_b = relationship("RelationshipBond", foreign_keys="RelationshipBond.userBId", back_populates="userB")
    soul_journey_entries = relationship("SoulJourneyEntry", back_populates="owner")
    soulmates_subscriptions = relationship("SoulmatesSubscription", back_populates="user")


class SoulProfile(Base):
    """Soul profile - one per user"""
    __tablename__ = "soul_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    primary_archetype = Column(String(100))
    attachment_style = Column(String(100))
    love_languages = Column(ARRAY(String))
    
    values_vector = Column(JSONB)  # 16-32D numeric vector
    astrology_meta = Column(JSONB)  # sun/moon/asc, element, etc.
    numerology_meta = Column(JSONB)  # life path, key numbers
    resonance_fingerprint = Column(JSONB)  # LifeState snapshot
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="soul_profile")


class CompatibilitySnapshot(Base):
    """Compatibility calculation results for a pair"""
    __tablename__ = "compatibility_snapshots"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_a_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user_b_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    model_version = Column(String(50), nullable=False)
    score_overall = Column(Float, nullable=False)
    score_axes = Column(JSONB)  # emotional, logistical, values, life-path etc.
    
    astro_used = Column(Boolean, default=False)
    num_used = Column(Boolean, default=False)
    soulmate_flag = Column(Boolean, default=False)
    
    debug_metrics = Column(JSONB)  # r2, delta_f1, etc.
    explanation_summary = Column(Text)
    explanation_details = Column(JSONB)
    
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    user_a = relationship("User", foreign_keys=[user_a_id])
    user_b = relationship("User", foreign_keys=[user_b_id])
    
    __table_args__ = (
        CheckConstraint("score_overall >= 0 AND score_overall <= 1", name="valid_score"),
    )


class RelationshipBond(Base):
    """Bond between two users for couple mode"""
    __tablename__ = "relationship_bonds"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_a_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user_b_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    status = Column(SQLEnum(BondStatus), default=BondStatus.PENDING)
    bond_type = Column(SQLEnum(BondType), default=BondType.ROMANTIC)
    visibility = Column(SQLEnum(BondVisibility), default=BondVisibility.PRIVATE)
    
    initiator_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    ended_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    
    current_label = Column(String(255))
    bond_metadata = Column(JSONB)  # Renamed from 'metadata' (reserved in SQLAlchemy)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    userA = relationship("User", foreign_keys=[user_a_id], back_populates="bonds_as_a")
    userB = relationship("User", foreign_keys=[user_b_id], back_populates="bonds_as_b")
    soul_journey_entries = relationship("SoulJourneyEntry", back_populates="bond")
    subscriptions = relationship("SoulmatesSubscription", back_populates="bond")
    
    __table_args__ = (
        CheckConstraint("user_a_id != user_b_id", name="different_users"),
    )


class BondInvite(Base):
    """Invitation to create a bond"""
    __tablename__ = "bond_invites"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    from_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    to_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    
    to_email = Column(String(255))
    invite_token = Column(String(255), unique=True)
    
    bond_type = Column(SQLEnum(BondType), default=BondType.ROMANTIC)
    status = Column(SQLEnum(BondInviteStatus), default=BondInviteStatus.PENDING)
    
    created_at = Column(DateTime, server_default=func.now())
    accepted_at = Column(DateTime, nullable=True)
    declined_at = Column(DateTime, nullable=True)
    expired_at = Column(DateTime, nullable=True)
    
    # Relationships
    from_user = relationship("User", foreign_keys=[from_user_id])
    to_user = relationship("User", foreign_keys=[to_user_id])


class SoulJourneyEntry(Base):
    """Journaling entries for self-reflection and relationship tracking"""
    __tablename__ = "soul_journey_entries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    bond_id = Column(UUID(as_uuid=True), ForeignKey("relationship_bonds.id", ondelete="SET NULL"), nullable=True)
    
    entry_type = Column(SQLEnum(SoulJourneyEntryType), default=SoulJourneyEntryType.SELF_REFLECTION)
    title = Column(String(255))
    body = Column(Text, nullable=False)
    tags = Column(ARRAY(String))
    
    mood_score = Column(Integer)  # 1-10 scale
    resonance_snapshot = Column(JSONB)
    
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="soul_journey_entries")
    bond = relationship("RelationshipBond", back_populates="soul_journey_entries")
    
    __table_args__ = (
        CheckConstraint("mood_score IS NULL OR (mood_score >= 1 AND mood_score <= 10)", name="valid_mood"),
    )


class SoulmatesPlan(Base):
    """Subscription plan definitions"""
    __tablename__ = "soulmates_plans"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(100), unique=True, nullable=False)  # "free", "plus", "couple-premium"
    tier = Column(SQLEnum(SoulmatesPlanTier), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    
    max_comp_explorer_runs_per_month = Column(Integer)
    max_active_bonds = Column(Integer)
    includes_resonance_lab = Column(Boolean, default=False)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    subscriptions = relationship("SoulmatesSubscription", back_populates="plan")


class SoulmatesSubscription(Base):
    """User or bond subscription to a plan"""
    __tablename__ = "soulmates_subscriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    bond_id = Column(UUID(as_uuid=True), ForeignKey("relationship_bonds.id", ondelete="SET NULL"), nullable=True)
    
    plan_id = Column(UUID(as_uuid=True), ForeignKey("soulmates_plans.id"), nullable=False)
    
    is_active = Column(Boolean, default=True)
    started_at = Column(DateTime, server_default=func.now())
    ends_at = Column(DateTime, nullable=True)
    canceled_at = Column(DateTime, nullable=True)
    
    external_provider = Column(String(50))  # "stripe", etc.
    external_ref = Column(String(255))  # Stripe subscription ID, etc.
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="soulmates_subscriptions")
    bond = relationship("RelationshipBond", back_populates="subscriptions")
    plan = relationship("SoulmatesPlan", back_populates="subscriptions")


class SoulmatesDeepReport(Base):
    """One-off deep compatibility reports"""
    __tablename__ = "soulmates_deep_reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    bond_id = Column(UUID(as_uuid=True), ForeignKey("relationship_bonds.id", ondelete="SET NULL"), nullable=True)
    
    type = Column(String(50), nullable=False)  # "self", "compatibility"
    title = Column(String(255), nullable=False)
    content = Column(JSONB, nullable=False)  # narrative report
    
    created_at = Column(DateTime, server_default=func.now())
    paid = Column(Boolean, default=False)
    external_ref = Column(String(255))  # Stripe payment intent ID, etc.


# B2B Models
class Organization(Base):
    """Organization for B2B features"""
    __tablename__ = "organizations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    memberships = relationship("OrganizationMembership", back_populates="organization")
    plans = relationship("OrganizationPlan", back_populates="organization")


class OrganizationMembership(Base):
    """User membership in an organization"""
    __tablename__ = "organization_memberships"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    role = Column(SQLEnum(OrgRole), default=OrgRole.MEMBER)
    
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    organization = relationship("Organization", back_populates="memberships")
    user = relationship("User")


class OrganizationPlan(Base):
    """Organization subscription to a soulmates plan"""
    __tablename__ = "organization_plans"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("soulmates_plans.id"), nullable=False)
    
    seat_count = Column(Integer, nullable=False)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    organization = relationship("Organization", back_populates="plans")
    plan = relationship("SoulmatesPlan")

