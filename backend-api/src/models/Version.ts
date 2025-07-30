import { getDatabase } from "../database/init";

export interface Version {
  id: string;
  project_id: string;
  version_number: number;
  message?: string;
  author?: string;
  document_data?: any;
  file_size: number;
  is_auto_save: boolean;
  created_at: string;
}

export interface CreateVersionData {
  project_id: string;
  message?: string;
  author?: string;
  document_data?: any;
  is_auto_save?: boolean;
}

export class VersionModel {
  static async create(data: CreateVersionData): Promise<Version> {
    const database = getDatabase();
    const id =
      "ver_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

    // Get next version number for this project
    const lastVersion = await database.get(
      "SELECT MAX(version_number) as max_version FROM versions WHERE project_id = ?",
      [data.project_id]
    );
    const versionNumber = (lastVersion?.max_version || 0) + 1;

    // Calculate file size
    const fileSize = data.document_data
      ? JSON.stringify(data.document_data).length
      : 0;

    await database.run(
      `INSERT INTO versions (id, project_id, version_number, message, author, document_data, file_size, is_auto_save) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.project_id,
        versionNumber,
        data.message,
        data.author,
        JSON.stringify(data.document_data),
        fileSize,
        data.is_auto_save || false,
      ]
    );

    const version = await database.get("SELECT * FROM versions WHERE id = ?", [
      id,
    ]);

    // Parse document_data back to object
    if (version && version.document_data) {
      try {
        version.document_data = JSON.parse(version.document_data);
      } catch (e) {
        console.warn("Failed to parse document_data for version:", id);
      }
    }

    return version as Version;
  }

  static async findByProject(projectId: string): Promise<Version[]> {
    const database = getDatabase();
    const versions = (await database.all(
      "SELECT * FROM versions WHERE project_id = ? ORDER BY version_number DESC",
      [projectId]
    )) as Version[];

    // Parse document_data for each version
    return versions.map((version) => {
      if (version.document_data) {
        try {
          version.document_data = JSON.parse(version.document_data as string);
        } catch (e) {
          console.warn(
            "Failed to parse document_data for version:",
            version.id
          );
        }
      }
      return version;
    });
  }

  static async findById(id: string): Promise<Version | null> {
    const database = getDatabase();
    const version = (await database.get("SELECT * FROM versions WHERE id = ?", [
      id,
    ])) as Version | null;

    if (version && version.document_data) {
      try {
        version.document_data = JSON.parse(version.document_data as string);
      } catch (e) {
        console.warn("Failed to parse document_data for version:", id);
      }
    }

    return version;
  }

  static async delete(id: string): Promise<boolean> {
    const database = getDatabase();
    const result = await database.run("DELETE FROM versions WHERE id = ?", [
      id,
    ]);
    return (result.changes || 0) > 0;
  }

  static async getProjectStats(projectId: string) {
    const database = getDatabase();

    const stats = await database.get(
      `
      SELECT 
        COUNT(*) as total_versions,
        SUM(file_size) as total_size,
        COUNT(CASE WHEN is_auto_save = 1 THEN 1 END) as auto_save_count,
        COUNT(CASE WHEN is_auto_save = 0 THEN 1 END) as manual_save_count,
        MAX(created_at) as last_version_date
      FROM versions 
      WHERE project_id = ?
    `,
      [projectId]
    );

    return stats;
  }
}
