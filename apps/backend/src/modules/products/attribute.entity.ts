import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';

@Entity('attributes')
export class Attribute {
  @ObjectIdColumn()
  id: string;

  @Column({ unique: true })
  name: string; // e.g., 'Color', 'Size'

  // Manual relation for MongoDB
  values?: AttributeValue[];
}

@Entity('attribute_values')
export class AttributeValue {
  @ObjectIdColumn()
  id: string;

  @Column()
  value: string; // e.g., 'Red', 'XL'

  @Column()
  attributeId: string;
}
