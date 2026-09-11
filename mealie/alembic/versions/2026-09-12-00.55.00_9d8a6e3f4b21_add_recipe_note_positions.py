"""add recipe note positions

Revision ID: 9d8a6e3f4b21
Revises: 4b91d3a7c0e2
Create Date: 2026-09-12 00:55:00.000000

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "9d8a6e3f4b21"
down_revision: str | None = "4b91d3a7c0e2"
branch_labels: str | tuple[str, ...] | None = None
depends_on: str | tuple[str, ...] | None = None


def upgrade():
    with op.batch_alter_table("notes", schema=None) as batch_op:
        batch_op.add_column(sa.Column("position", sa.Integer(), nullable=True))

    connection = op.get_bind()
    rows = connection.execute(sa.text("SELECT id, recipe_id FROM notes ORDER BY recipe_id, id")).fetchall()
    positions: dict[object, int] = {}

    for note_id, recipe_id in rows:
        position = positions.get(recipe_id, 0)
        connection.execute(
            sa.text("UPDATE notes SET position = :position WHERE id = :id"),
            {"position": position, "id": note_id},
        )
        positions[recipe_id] = position + 1

    with op.batch_alter_table("notes", schema=None) as batch_op:
        batch_op.alter_column("position", existing_type=sa.Integer(), nullable=False)
        batch_op.create_index(batch_op.f("ix_notes_position"), ["position"], unique=False)


def downgrade():
    with op.batch_alter_table("notes", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_notes_position"))
        batch_op.drop_column("position")
