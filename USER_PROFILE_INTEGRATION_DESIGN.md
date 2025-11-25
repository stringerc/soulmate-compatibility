# 👤 User Profile Integration Design
## Detailed Technical Specification for SyncScript Integration

**Date**: December 24, 2024  
**Purpose**: Detailed design for incorporating soulmate compatibility into syncscript.app user profiles

---

## Database Schema Design

### User Profile Table Extension

```sql
-- Add compatibility fields to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS compatibility_traits JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS compatibility_birthdate DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS compatibility_life_path_number INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS compatibility_zodiac_sign VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS compatibility_test_completed_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS compatibility_test_version VARCHAR(10);

-- Compatibility preferences table
CREATE TABLE IF NOT EXISTS compatibility_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    min_compatibility_score DECIMAL(3,2) DEFAULT 0.5,
    include_astrology BOOLEAN DEFAULT true,
    include_numerology BOOLEAN DEFAULT true,
    preferred_dimensions TEXT[], -- Array of dimension names
    visibility VARCHAR(20) DEFAULT 'friends', -- 'public', 'friends', 'private'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compatibility scores cache (pre-computed for performance)
CREATE TABLE IF NOT EXISTS compatibility_scores (
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    compatibility_score DECIMAL(5,4) NOT NULL, -- S_hat score
    trait_compatibility DECIMAL(5,4),
    resonance_compatibility DECIMAL(5,4),
    numerology_score DECIMAL(5,4),
    astrology_score DECIMAL(5,4),
    dimension_breakdown JSONB,
    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user1_id, user2_id)
);

CREATE INDEX idx_compatibility_scores_user1 ON compatibility_scores(user1_id, compatibility_score DESC);
CREATE INDEX idx_compatibility_scores_user2 ON compatibility_scores(user2_id, compatibility_score DESC);

-- Resonance history table
CREATE TABLE IF NOT EXISTS resonance_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    metrics DECIMAL[] NOT NULL, -- 7D resonance vector
    context VARCHAR(50), -- 'messaging', 'meetup', 'conflict', etc.
    interaction_id UUID, -- Reference to message/event that triggered update
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resonance_history_pair ON resonance_history(user1_id, user2_id, created_at DESC);
```

---

## API Endpoints Design

### 1. Sync Compatibility Data

**Endpoint**: `POST /api/v1/users/{user_id}/compatibility/sync`

**Purpose**: Sync compatibility test results from soulmates.syncscript.app to syncscript.app profile

**Request**:
```json
{
  "traits": [0.1, 0.2, ..., 0.9], // 32D vector
  "birthdate": "1990-01-01",
  "life_path_number": 7,
  "zodiac_sign": "Aries",
  "test_completed_at": "2024-12-24T10:00:00Z",
  "test_version": "v1.0"
}
```

**Response**:
```json
{
  "success": true,
  "user_id": "uuid",
  "compatibility": {
    "traits": [0.1, 0.2, ..., 0.9],
    "birthdate": "1990-01-01",
    "life_path_number": 7,
    "zodiac_sign": "Aries",
    "test_completed_at": "2024-12-24T10:00:00Z"
  },
  "message": "Compatibility data synced successfully"
}
```

**Implementation**:
```python
@router.post("/api/v1/users/{user_id}/compatibility/sync")
async def sync_compatibility_data(
    user_id: UUID,
    compatibility_data: CompatibilitySyncRequest,
    current_user: User = Depends(get_current_user)
):
    # Verify user owns this profile
    if current_user.id != user_id:
        raise HTTPException(403, "Cannot sync compatibility for other users")
    
    # Update user profile
    user = db.query(User).filter(User.id == user_id).first()
    user.compatibility_traits = compatibility_data.traits
    user.compatibility_birthdate = compatibility_data.birthdate
    user.compatibility_life_path_number = compatibility_data.life_path_number
    user.compatibility_zodiac_sign = compatibility_data.zodiac_sign
    user.compatibility_test_completed_at = compatibility_data.test_completed_at
    user.compatibility_test_version = compatibility_data.test_version
    
    db.commit()
    
    # Invalidate compatibility score cache for this user
    invalidate_compatibility_cache(user_id)
    
    return {
        "success": True,
        "user_id": str(user_id),
        "compatibility": {
            "traits": compatibility_data.traits,
            "birthdate": compatibility_data.birthdate,
            "life_path_number": compatibility_data.life_path_number,
            "zodiac_sign": compatibility_data.zodiac_sign,
            "test_completed_at": compatibility_data.test_completed_at.isoformat(),
        }
    }
```

---

### 2. Get Compatibility Matches

**Endpoint**: `GET /api/v1/users/{user_id}/compatibility/matches`

**Purpose**: Get compatible users for a given user

**Query Parameters**:
- `limit`: Number of matches to return (default: 20)
- `min_score`: Minimum compatibility score (default: from preferences)
- `include_astrology`: Include astrology in calculation (default: from preferences)
- `include_numerology`: Include numerology in calculation (default: from preferences)

**Response**:
```json
{
  "matches": [
    {
      "user": {
        "id": "uuid",
        "name": "Jane Doe",
        "photo": "https://...",
        "compatibility_score": 0.85
      },
      "compatibility": {
        "score": 0.85,
        "trait_compatibility": 0.78,
        "resonance_compatibility": 0.92,
        "numerology_score": 0.88,
        "astrology_score": 0.82,
        "dimension_breakdown": {
          "attachment_alignment": 0.91,
          "conflict_alignment": 0.76,
          "value_alignment": 0.94
        },
        "soulmate_tier": true,
        "percentile": 92.5
      },
      "resonance": {
        "metrics": [0.6, 0.7, 0.8, 0.75, 0.65, 0.7, 0.8],
        "mean": 0.714,
        "stability": 0.85
      }
    }
  ],
  "total_matches": 150,
  "filters_applied": {
    "min_score": 0.7,
    "include_astrology": true,
    "include_numerology": true
  }
}
```

**Implementation**:
```python
@router.get("/api/v1/users/{user_id}/compatibility/matches")
async def get_compatibility_matches(
    user_id: UUID,
    limit: int = 20,
    min_score: Optional[float] = None,
    include_astrology: Optional[bool] = None,
    include_numerology: Optional[bool] = None,
    current_user: User = Depends(get_current_user)
):
    # Get user profile
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.compatibility_traits:
        raise HTTPException(404, "User compatibility data not found")
    
    # Get preferences
    prefs = db.query(CompatibilityPreferences).filter(
        CompatibilityPreferences.user_id == user_id
    ).first()
    
    if not prefs:
        # Create default preferences
        prefs = CompatibilityPreferences(user_id=user_id)
        db.add(prefs)
        db.commit()
    
    # Use provided params or preferences
    min_score = min_score or prefs.min_compatibility_score
    include_astrology = include_astrology if include_astrology is not None else prefs.include_astrology
    include_numerology = include_numerology if include_numerology is not None else prefs.include_numerology
    
    # Get all other users with compatibility data
    other_users = db.query(User).filter(
        User.id != user_id,
        User.compatibility_traits.isnot(None)
    ).all()
    
    matches = []
    for other_user in other_users:
        # Check cache first
        cached_score = db.query(CompatibilityScore).filter(
            CompatibilityScore.user1_id == user_id,
            CompatibilityScore.user2_id == other_user.id
        ).first()
        
        if cached_score and cached_score.computed_at > datetime.now() - timedelta(days=7):
            # Use cached score
            compatibility = {
                "score": float(cached_score.compatibility_score),
                "trait_compatibility": float(cached_score.trait_compatibility),
                "resonance_compatibility": float(cached_score.resonance_compatibility),
                "numerology_score": float(cached_score.numerology_score) if cached_score.numerology_score else None,
                "astrology_score": float(cached_score.astrology_score) if cached_score.astrology_score else None,
                "dimension_breakdown": cached_score.dimension_breakdown,
            }
        else:
            # Calculate compatibility
            compatibility_result = calculate_compatibility(
                person1_traits=user.compatibility_traits,
                person2_traits=other_user.compatibility_traits,
                birthdate1=user.compatibility_birthdate,
                birthdate2=other_user.compatibility_birthdate,
                include_astrology=include_astrology,
                include_numerology=include_numerology,
            )
            
            # Cache result
            cached_score = CompatibilityScore(
                user1_id=user_id,
                user2_id=other_user.id,
                compatibility_score=compatibility_result["compatibility_score"],
                trait_compatibility=compatibility_result["trait_compatibility"],
                resonance_compatibility=compatibility_result["resonance_compatibility"],
                numerology_score=compatibility_result.get("numerology_score"),
                astrology_score=compatibility_result.get("astrology_score"),
                dimension_breakdown=compatibility_result.get("dimension_breakdown"),
            )
            db.add(cached_score)
            db.commit()
            
            compatibility = compatibility_result
        
        # Filter by min score
        if compatibility["score"] < min_score:
            continue
        
        # Get resonance (if available)
        resonance = get_latest_resonance(user_id, other_user.id)
        
        matches.append({
            "user": {
                "id": str(other_user.id),
                "name": other_user.name,
                "photo": other_user.photo,
                "compatibility_score": compatibility["score"],
            },
            "compatibility": compatibility,
            "resonance": resonance,
        })
    
    # Sort by compatibility score
    matches.sort(key=lambda x: x["compatibility"]["score"], reverse=True)
    
    return {
        "matches": matches[:limit],
        "total_matches": len(matches),
        "filters_applied": {
            "min_score": min_score,
            "include_astrology": include_astrology,
            "include_numerology": include_numerology,
        }
    }
```

---

### 3. Calculate Compatibility (Direct)

**Endpoint**: `POST /api/v1/compatibility/calculate`

**Purpose**: Calculate compatibility between two users (or arbitrary trait vectors)

**Request**:
```json
{
  "user1_id": "uuid", // Optional: if provided, uses profile data
  "user2_id": "uuid", // Optional: if provided, uses profile data
  "person1": { // Required if user1_id not provided
    "traits": [0.1, 0.2, ..., 0.9],
    "birthdate": "1990-01-01"
  },
  "person2": { // Required if user2_id not provided
    "traits": [0.9, 0.8, ..., 0.1],
    "birthdate": "1992-03-15"
  },
  "resonance": [0.5, 0.5, ..., 0.5], // Optional: 7D vector
  "include_numerology": true,
  "include_astrology": true
}
```

**Response**: Same as B2B API response (see `B2B_IMPLEMENTATION_GUIDE.md`)

---

### 4. Update Resonance

**Endpoint**: `POST /api/v1/users/{user1_id}/resonance/{user2_id}`

**Purpose**: Update resonance metrics based on interaction

**Request**:
```json
{
  "metrics": [0.6, 0.7, 0.8, 0.75, 0.65, 0.7, 0.8], // 7D vector
  "context": "messaging", // 'messaging', 'meetup', 'conflict', etc.
  "interaction_id": "uuid" // Reference to message/event
}
```

**Response**:
```json
{
  "success": true,
  "resonance": {
    "metrics": [0.6, 0.7, 0.8, 0.75, 0.65, 0.7, 0.8],
    "mean": 0.714,
    "stability": 0.85,
    "updated_at": "2024-12-24T10:00:00Z"
  }
}
```

---

## Frontend Components

### 1. Compatibility Profile Badge

**Component**: `CompatibilityBadge.tsx`

```tsx
interface CompatibilityBadgeProps {
  userId: string;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function CompatibilityBadge({ userId, score, size = 'md' }: CompatibilityBadgeProps) {
  const { data: compatibility } = useCompatibility(userId);
  const displayScore = score ?? compatibility?.score;
  
  if (!displayScore) return null;
  
  const tier = getCompatibilityTier(displayScore);
  const color = tier === 'soulmate' ? 'green' : tier === 'high' ? 'blue' : 'yellow';
  
  return (
    <Badge color={color} size={size}>
      {Math.round(displayScore * 100)}% Match
    </Badge>
  );
}
```

### 2. Compatibility Breakdown Page

**Component**: `CompatibilityBreakdown.tsx`

```tsx
interface CompatibilityBreakdownProps {
  user1Id: string;
  user2Id: string;
}

export function CompatibilityBreakdown({ user1Id, user2Id }: CompatibilityBreakdownProps) {
  const { data: compatibility, isLoading } = useCompatibilityCalculation(user1Id, user2Id);
  
  if (isLoading) return <Loading />;
  if (!compatibility) return <NotFound />;
  
  return (
    <div className="compatibility-breakdown">
      <CompatibilityScoreCard score={compatibility.compatibility_score} />
      <DimensionBreakdownChart breakdown={compatibility.dimension_breakdown} />
      {compatibility.numerology_score && (
        <NumerologyInsight score={compatibility.numerology_score} />
      )}
      {compatibility.astrology_score && (
        <AstrologyInsight score={compatibility.astrology_score} />
      )}
      <Recommendations recommendations={compatibility.recommendations} />
    </div>
  );
}
```

### 3. Matching Interface

**Component**: `CompatibilityMatches.tsx`

```tsx
export function CompatibilityMatches() {
  const { data: matches, isLoading } = useCompatibilityMatches();
  const [filters, setFilters] = useState({
    minScore: 0.7,
    includeAstrology: true,
    includeNumerology: true,
  });
  
  return (
    <div className="compatibility-matches">
      <CompatibilityFilters filters={filters} onChange={setFilters} />
      <MatchGrid matches={matches} />
    </div>
  );
}
```

---

## Data Sync Flow

### Option A: Real-Time Sync (Recommended)

```
soulmates.syncscript.app
  ↓ User completes test
  ↓ Results saved to user account
  ↓ POST /api/v1/users/{user_id}/compatibility/sync
syncscript.app Backend
  ↓ Update user profile
  ↓ Invalidate compatibility cache
  ↓ Trigger background job to recalculate matches
  ↓ Return success
soulmates.syncscript.app
  ↓ Show "Synced to SyncScript" confirmation
```

### Option B: Background Sync

```
soulmates.syncscript.app
  ↓ User completes test
  ↓ Results saved to user account
  ↓ Queue sync job
Background Worker
  ↓ Process sync queue
  ↓ POST /api/v1/users/{user_id}/compatibility/sync
syncscript.app Backend
  ↓ Update user profile
  ↓ Invalidate cache
```

---

## Security Considerations

### Authentication

- **JWT Tokens**: All API requests require valid JWT token
- **User Verification**: Users can only sync/update their own compatibility data
- **Rate Limiting**: Limit sync requests to prevent abuse

### Privacy

- **Visibility Settings**: Respect user privacy preferences
- **Data Encryption**: Encrypt sensitive compatibility data at rest
- **Access Control**: Only allow viewing compatibility if user has permission

---

## Performance Optimization

### Caching Strategy

1. **Compatibility Scores**: Cache for 7 days (recalculate if profiles change)
2. **User Profiles**: Cache compatibility traits in Redis
3. **Match Lists**: Cache top matches for 1 hour

### Background Jobs

1. **Pre-compute Compatibility**: Calculate scores for all user pairs nightly
2. **Update Resonance**: Process interaction events asynchronously
3. **Cache Invalidation**: Invalidate cache when profiles update

---

## Testing Strategy

### Unit Tests

- Compatibility calculation accuracy
- Resonance update logic
- Cache invalidation

### Integration Tests

- API endpoint functionality
- Data sync flow
- Matching algorithm

### E2E Tests

- Complete test → sync → match flow
- User profile display
- Matching interface

---

## Migration Plan

### Phase 1: Database Migration

1. Add compatibility columns to users table
2. Create compatibility_preferences table
3. Create compatibility_scores table
4. Create resonance_history table

### Phase 2: API Implementation

1. Implement sync endpoint
2. Implement matches endpoint
3. Implement compatibility calculation endpoint
4. Implement resonance update endpoint

### Phase 3: Frontend Integration

1. Add compatibility badge component
2. Build compatibility breakdown page
3. Create matching interface
4. Add discovery features

### Phase 4: Background Jobs

1. Implement compatibility pre-computation job
2. Implement resonance update job
3. Implement cache invalidation job

---

**Document Version**: 1.0  
**Last Updated**: December 24, 2024  
**Status**: Ready for Implementation

