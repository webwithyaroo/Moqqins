import { getDatabase } from '../database/init';

export interface Project {
  id: string;
  name: string;
  figma_file_id?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectData {
  name: string;
  figma_file_id?: string;
  description?: string;
}

export class ProjectModel {
  static async create(data: CreateProjectData): Promise<Project> {
    const database = getDatabase();
    const id = 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    await database.run(
      `INSERT INTO projects (id, name, figma_file_id, description) VALUES (?, ?, ?, ?)`,
      [id, data.name, data.figma_file_id, data.description]
    );
    
    const project = await database.get('SELECT * FROM projects WHERE id = ?', [id]);
    return project as Project;
  }

  static async findAll(): Promise<Project[]> {
    const database = getDatabase();
    return await database.all('SELECT * FROM projects ORDER BY created_at DESC') as Project[];
  }

  static async findById(id: string): Promise<Project | null> {
    const database = getDatabase();
    const project = await database.get('SELECT * FROM projects WHERE id = ?', [id]);
    return project as Project | null;
  }

  static async findByFigmaId(figmaId: string): Promise<Project | null> {
    const database = getDatabase();
    const project = await database.get('SELECT * FROM projects WHERE figma_file_id = ?', [figmaId]);
    return project as Project | null;
  }

  static async update(id: string, data: Partial<CreateProjectData>): Promise<Project | null> {
    const database = getDatabase();
    
    const updateFields = [];
    const updateValues = [];
    
    if (data.name) {
      updateFields.push('name = ?');
      updateValues.push(data.name);
    }
    if (data.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(data.description);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);
    
    await database.run(
      `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    return await ProjectModel.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const database = getDatabase();
    const result = await database.run('DELETE FROM projects WHERE id = ?', [id]);
    return (result.changes || 0) > 0;
  }

  static async getVersionCount(projectId: string): Promise<number> {
    const database = getDatabase();
    const result = await database.get(
      'SELECT COUNT(*) as count FROM versions WHERE project_id = ?',
      [projectId]
    );
    return result?.count || 0;
  }
}