"""Initial case management tables

Revision ID: 001
Revises: 
Create Date: 2026-07-10 00:00:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'cases',
        sa.Column('case_id', sa.String(), nullable=False),
        sa.Column('complaint_id', sa.String(), nullable=True),
        sa.Column('assigned_officer_id', sa.String(), nullable=True),
        sa.Column('case_number', sa.String(), nullable=True),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('priority', sa.String(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('closed_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('case_id'),
        sa.ForeignKeyConstraint(['complaint_id'], ['complaints.complaint_id']),
        sa.ForeignKeyConstraint(['assigned_officer_id'], ['officers.officer_id']),
    )

    op.create_table(
        'evidences',
        sa.Column('evidence_id', sa.String(), nullable=False),
        sa.Column('case_id', sa.String(), nullable=True),
        sa.Column('evidence_type', sa.String(), nullable=True),
        sa.Column('file_path', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('evidence_id'),
        sa.ForeignKeyConstraint(['case_id'], ['cases.case_id']),
    )

    op.create_table(
        'case_diaries',
        sa.Column('diary_id', sa.String(), nullable=False),
        sa.Column('case_id', sa.String(), nullable=True),
        sa.Column('officer_id', sa.String(), nullable=True),
        sa.Column('action_type', sa.String(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('occurred_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('related_evidence_id', sa.String(), nullable=True),
        sa.Column('related_document_id', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('diary_id'),
        sa.ForeignKeyConstraint(['case_id'], ['cases.case_id']),
        sa.ForeignKeyConstraint(['officer_id'], ['officers.officer_id']),
        sa.ForeignKeyConstraint(['related_evidence_id'], ['evidences.evidence_id']),
        sa.ForeignKeyConstraint(['related_document_id'], ['documents.document_id']),
    )


def downgrade() -> None:
    op.drop_table('case_diaries')
    op.drop_table('evidences')
    op.drop_table('cases')
