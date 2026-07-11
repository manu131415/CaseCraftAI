"""persons and medical records

Revision ID: 004
Revises: 003
Create Date: 2026-07-11 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade():
    # Create accused table
    op.create_table(
        'accused',
        sa.Column('accused_id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('case_id', sa.String(), nullable=True),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('alias', sa.String(length=255), nullable=True),
        sa.Column('father_name', sa.String(length=255), nullable=True),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('dob', sa.Date(), nullable=True),
        sa.Column('gender', sa.String(length=20), nullable=True),
        sa.Column('permanent_address', sa.Text(), nullable=True),
        sa.Column('present_address', sa.Text(), nullable=True),
        sa.Column('arrest_datetime', sa.DateTime(timezone=True), nullable=True),
        sa.Column('custody_status', sa.String(length=100), nullable=True),
        sa.Column('identification_marks', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('face_shape', sa.String(length=50), nullable=True),
        sa.Column('complexion', sa.String(length=50), nullable=True),
        sa.Column('eye_color', sa.String(length=50), nullable=True),
        sa.Column('eye_structure', sa.String(length=50), nullable=True),
        sa.Column('hair_type', sa.String(length=50), nullable=True),
        sa.Column('hair_color', sa.String(length=50), nullable=True),
        sa.Column('front_photo', sa.Text(), nullable=True),
        sa.Column('left_profile_photo', sa.Text(), nullable=True),
        sa.Column('right_profile_photo', sa.Text(), nullable=True),
        sa.Column('capture_date', sa.Date(), nullable=True),
        sa.PrimaryKeyConstraint('accused_id'),
        sa.ForeignKeyConstraint(['case_id'], ['cases.case_id'], name='accused_case_id_fkey')
    )
    op.create_index('accused_pkey', 'accused', ['accused_id'], unique=True)

    # Create victims table
    op.create_table(
        'victims',
        sa.Column('victim_id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('case_id', sa.String(), nullable=True),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('gender', sa.String(length=20), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('injuries', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('victim_id'),
        sa.ForeignKeyConstraint(['case_id'], ['cases.case_id'], name='victims_case_id_fkey')
    )
    op.create_index('victims_pkey', 'victims', ['victim_id'], unique=True)

    # Create witnesses table
    op.create_table(
        'witnesses',
        sa.Column('witness_id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('case_id', sa.String(), nullable=True),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('statement', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('witness_id'),
        sa.ForeignKeyConstraint(['case_id'], ['cases.case_id'], name='witnesses_case_id_fkey')
    )
    op.create_index('witnesses_pkey', 'witnesses', ['witness_id'], unique=True)

    # Create medical_reports table
    op.create_table(
        'medical_reports',
        sa.Column('report_id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('case_id', sa.String(), nullable=True),
        sa.Column('accused_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('victim_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('hospital_name', sa.String(length=255), nullable=True),
        sa.Column('doctor_name', sa.String(length=255), nullable=True),
        sa.Column('visible_injuries', sa.Text(), nullable=True),
        sa.Column('injury_type', sa.String(length=100), nullable=True),
        sa.Column('medical_fitness', sa.Text(), nullable=True),
        sa.Column('report_number', sa.String(length=100), nullable=True),
        sa.Column('examination_datetime', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('report_id'),
        sa.ForeignKeyConstraint(['case_id'], ['cases.case_id'], name='medical_reports_case_id_fkey'),
        sa.ForeignKeyConstraint(['accused_id'], ['accused.accused_id'], name='medical_reports_accused_id_fkey'),
        sa.ForeignKeyConstraint(['victim_id'], ['victims.victim_id'], name='medical_reports_victim_id_fkey')
    )
    op.create_index('medical_reports_pkey', 'medical_reports', ['report_id'], unique=True)


def downgrade():
    op.drop_index('medical_reports_pkey', table_name='medical_reports')
    op.drop_table('medical_reports')
    
    op.drop_index('witnesses_pkey', table_name='witnesses')
    op.drop_table('witnesses')
    
    op.drop_index('victims_pkey', table_name='victims')
    op.drop_table('victims')
    
    op.drop_index('accused_pkey', table_name='accused')
    op.drop_table('accused')
