# Verification & Deployment Checklist

## Pre-Deployment Verification

### Code Quality

- [x] All imports updated in complaints.py
- [x] Helper functions follow DRY principle
- [x] Error handling implemented (try/except/finally)
- [x] Database transactions properly managed
- [x] Foreign keys properly configured
- [x] Cascade deletes implemented
- [x] Response models match schema

### Backend Testing

```bash
# Verify imports
python -c "from app.apis.complaints import router; print('Imports OK')"

# Check model structure
python -c "from models.complaint import Complaint; print(Complaint.__table__.columns.keys())"

# Verify migration
alembic current
```

### Frontend Testing

```bash
# Check TypeScript
npm run build

# Verify components
grep -r "onSaveDraft" components/complaint/
```

### Database Verification

```sql
-- Check schema
\d complaints;

-- Verify is_draft column
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'complaints' AND column_name = 'is_draft';

-- Check foreign keys
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name = 'victims' AND constraint_type = 'FOREIGN KEY';
```

## Integration Testing Scenarios

### Scenario 1: Save Draft and Retrieve
```
1. POST /api/complaints/save-draft with partial data
2. Verify: is_draft = true, status = "Draft"
3. GET /api/complaints/{id}
4. Verify: All fields populated
```

### Scenario 2: Submit Complaint
```
1. POST /api/complaints/submit with complete data
2. Verify: is_draft = false, status = "Submitted"
3. Verify: All related records created
4. GET /api/complaints/{id}
5. Verify: victims array not empty
6. Verify: suspects array not empty
```

### Scenario 3: Multiple Victims/Suspects
```
1. Create complaint with 3 victims, 2 suspects
2. GET /api/complaints/{id}
3. Verify: victims.length = 3
4. Verify: suspects.length = 2
5. Delete complaint
6. Verify: All 5 records deleted (cascade)
```

### Scenario 4: Unknown Suspects
```
1. Submit complaint with unknownIdentity = true
2. Verify: full_name can be null
3. Verify: unknown_identity = true in database
4. GET /api/complaints/{id}
5. Verify: suspect object has unknownIdentity flag
```

### Scenario 5: Document Upload
```
1. POST /api/complaints/upload-evidence
2. Verify: Returns cloudinaryUrl
3. Add to attachments array
4. POST /api/complaints/submit
5. Verify: Evidence records created
6. GET /api/complaints/{id}
7. Verify: documents array populated
```

## Performance Verification

### Query Performance
```sql
-- Should use index on complaint_id
EXPLAIN SELECT * FROM victims WHERE complaint_id = 'xxx';

-- Check index usage
SELECT * FROM pg_indexes WHERE tablename = 'victims';
```

### Response Time
```bash
# Measure GET request
time curl http://localhost:8000/api/complaints/xxx

# Should be < 100ms for single complaint
# Should be < 500ms for list of 100 complaints
```

## Security Verification

### SQL Injection Prevention
- [x] Using SQLAlchemy ORM (not raw SQL)
- [x] Pydantic models for validation
- [x] No string concatenation in queries

### Authorization (Future)
- [ ] Add user authentication
- [ ] Add permission checks
- [ ] Implement role-based access

### Data Validation
- [x] Age parsed to integer (prevents invalid data)
- [x] Phone/Email validated
- [x] Dates parsed to datetime
- [x] Boolean flags properly typed

## Compatibility Checklist

### Database Compatibility
- [x] PostgreSQL 12+ compatible
- [x] Boolean column type supported
- [x] Foreign keys supported
- [x] CASCADE DELETE supported

### Python Compatibility
- [x] Python 3.8+
- [x] SQLAlchemy 1.4+
- [x] FastAPI 0.68+
- [x] Pydantic 1.8+

### Browser Compatibility
- [x] Chrome/Edge (tested)
- [x] Firefox (compatible)
- [x] Safari (compatible)
- [x] Mobile browsers (responsive)

## Deployment Steps

### Step 1: Backup Database
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Apply Migrations
```bash
cd backend
alembic upgrade head
alembic current  # Verify
```

### Step 3: Deploy Backend
```bash
# Restart FastAPI server
supervisorctl restart casecraft_api

# Or if using Docker
docker-compose up -d backend
```

### Step 4: Deploy Frontend
```bash
cd frontend
npm run build
npm start

# Or if using Docker
docker-compose up -d frontend
```

### Step 5: Verify Endpoints
```bash
# Test each endpoint
curl http://api.example.com/api/complaints
curl -X POST http://api.example.com/api/complaints/save-draft -d @test.json
```

## Monitoring & Logging

### Backend Logging
```python
# Log level should be set to INFO in production
import logging
logger = logging.getLogger(__name__)
logger.info(f"Creating complaint {complaint_id}")
```

### Database Monitoring
```sql
-- Monitor slow queries
SELECT query, calls, mean_time FROM pg_stat_statements 
WHERE query LIKE '%complaints%' 
ORDER BY mean_time DESC;
```

### Frontend Monitoring
```javascript
// Log API calls
console.log('API Response:', response.data);
// Use Sentry or similar for error tracking
```

## Rollback Plan

If issues occur:

### Quick Rollback (Database Only)
```bash
# Undo migration
alembic downgrade -1

# Verify
alembic current
```

### Full Rollback
```bash
# Restore from backup
psql $DATABASE_URL < backup_file.sql

# Restart services
supervisorctl restart casecraft_api
```

## Post-Deployment Tasks

- [ ] Monitor error logs for 24 hours
- [ ] Verify all complaint submission flows work
- [ ] Test draft saving and retrieval
- [ ] Monitor database performance
- [ ] Check API response times
- [ ] Validate user complaints are being stored
- [ ] Test edge cases (empty victims, etc.)

## Success Criteria

✅ All checks below should pass:

1. **Functional**
   - [ ] Can save complaint as draft
   - [ ] Can submit complete complaint
   - [ ] Draft complaints show is_draft=true
   - [ ] Submitted complaints show is_draft=false
   - [ ] Related records visible in GET response
   - [ ] Draft can be deleted without errors

2. **Data Quality**
   - [ ] No orphaned records after deletion
   - [ ] All foreign keys intact
   - [ ] Dates parsed correctly
   - [ ] Age values as integers
   - [ ] Unknowns handled properly

3. **Performance**
   - [ ] GET response < 100ms (single)
   - [ ] GET response < 500ms (list)
   - [ ] POST response < 500ms
   - [ ] DELETE response < 100ms

4. **Reliability**
   - [ ] Transaction rollback on error
   - [ ] No database corruption
   - [ ] Error messages helpful
   - [ ] Logging captures issues

## Support Contact

For issues during deployment:

1. Check logs: `docker logs backend` or check error logs
2. Review: COMPLAINT_INGESTION_GUIDE.md
3. Verify: Database migration status with `alembic current`
4. Test: Individual endpoints with curl
5. Debug: Check backend/complaints.py for logic errors

## Sign-Off

- [ ] Backend Developer: _______________ Date: ______
- [ ] Database Admin: _________________ Date: ______
- [ ] Frontend Developer: ______________ Date: ______
- [ ] QA Lead: _______________________ Date: ______
- [ ] DevOps/Deployment: ______________ Date: ______

## Version Information

- Implementation Date: 2026-07-19
- Database Migration: 007_add_is_draft_to_complaints
- Backend Version: Updated app/apis/complaints.py
- Frontend Version: Updated NavigationButtons.tsx, ComplaintWizard.tsx
- Documentation Version: 1.0

---

**Document prepared for:** CaseCraftAI Complaint Ingestion System Update
**Status:** Ready for Deployment
**Last Updated:** 2026-07-19
