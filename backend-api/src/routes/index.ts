import { Router } from "express";
import { ProjectModel } from "../models/Project";
import { VersionModel } from "../models/Version";

const router = Router();

// API info endpoint
router.get("/", (req, res) => {
  res.json({
    name: "Moqqins API",
    version: "1.0.0",
    description: "Version control and collaboration for design teams",
    status: "active",
    database: "SQLite connected",
    endpoints: {
      health: "/health",
      projects: "/api/v1/projects",
      versions: "/api/v1/projects/:id/versions",
      test: "/api/v1/test",
    },
    timestamp: new Date().toISOString(),
  });
});

// Test endpoint for plugin connection
router.get("/test", (req, res) => {
  res.json({
    message: "Moqqins API with database is working perfectly!",
    timestamp: new Date().toISOString(),
    connection: "successful",
    database: "connected",
    ready_for_plugin: true,
  });
});

// Projects endpoints
router.post("/projects", async (req, res) => {
  try {
    const { name, figma_file_id, description } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Project name is required",
      });
    }

    // Check if project with this Figma ID already exists
    if (figma_file_id) {
      const existingProject = await ProjectModel.findByFigmaId(figma_file_id);
      if (existingProject) {
        console.log(
          "Returning existing project for Figma file:",
          figma_file_id
        );
        return res.json(existingProject);
      }
    }

    const project = await ProjectModel.create({
      name,
      figma_file_id,
      description,
    });

    console.log("✅ Created new project:", project.id);
    res.status(201).json(project);
  } catch (error) {
    console.error("❌ Error creating project:", error);
    res.status(500).json({
      error: "Failed to create project",
      message: (error as Error).message,
    });
  }
});

router.get("/projects", async (req, res) => {
  try {
    const projects = await ProjectModel.findAll();

    // Add version count to each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const versionCount = await ProjectModel.getVersionCount(project.id);
        return { ...project, version_count: versionCount };
      })
    );

    res.json({
      projects: projectsWithCounts,
      total: projectsWithCounts.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error fetching projects:", error);
    res.status(500).json({
      error: "Failed to fetch projects",
      message: (error as Error).message,
    });
  }
});

router.get("/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const project = await ProjectModel.findById(id);

    if (!project) {
      return res.status(404).json({
        error: "Not Found",
        message: "Project not found",
      });
    }

    // Add version count and stats
    const versionCount = await ProjectModel.getVersionCount(project.id);
    const stats = await VersionModel.getProjectStats(project.id);

    res.json({
      ...project,
      version_count: versionCount,
      stats,
    });
  } catch (error) {
    console.error("❌ Error fetching project:", error);
    res.status(500).json({
      error: "Failed to fetch project",
      message: (error as Error).message,
    });
  }
});

// Versions endpoints
router.post("/projects/:projectId/versions", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { message, author, document_data, is_auto_save } = req.body;

    // Verify project exists
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: "Not Found",
        message: "Project not found",
      });
    }

    const version = await VersionModel.create({
      project_id: projectId,
      message: message || "Version created via Moqqins",
      author: author || "Unknown User",
      document_data,
      is_auto_save: is_auto_save || false,
    });

    console.log(
      `✅ Created version ${version.version_number} for project ${projectId}`
    );
    res.status(201).json(version);
  } catch (error) {
    console.error("❌ Error creating version:", error);
    res.status(500).json({
      error: "Failed to create version",
      message: (error as Error).message,
    });
  }
});

router.get("/projects/:projectId/versions", async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project exists
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: "Not Found",
        message: "Project not found",
      });
    }

    const versions = await VersionModel.findByProject(projectId);

    res.json({
      versions,
      total: versions.length,
      project_id: projectId,
      project_name: project.name,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error fetching versions:", error);
    res.status(500).json({
      error: "Failed to fetch versions",
      message: (error as Error).message,
    });
  }
});

router.get("/versions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const version = await VersionModel.findById(id);

    if (!version) {
      return res.status(404).json({
        error: "Not Found",
        message: "Version not found",
      });
    }

    res.json(version);
  } catch (error) {
    console.error("❌ Error fetching version:", error);
    res.status(500).json({
      error: "Failed to fetch version",
      message: (error as Error).message,
    });
  }
});

export default router;
