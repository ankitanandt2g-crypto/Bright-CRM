const mongoose = require("mongoose");

const Installation =
    mongoose.models.Installation || mongoose.model("Installation");

let Job = null;
try {
    Job = mongoose.models.Job || mongoose.model("Job");
} catch (err) {
    console.warn("Job model not loaded yet.");
}

const normalizePayload = (body = {}) => {
    let assignedTeam = body.assignedTeam || [];

    if (typeof assignedTeam === "string") {
        try {
            assignedTeam = JSON.parse(assignedTeam);
        } catch (e) {
            assignedTeam = assignedTeam ? [assignedTeam] : [];
        }
    }

    if (!Array.isArray(assignedTeam)) {
        assignedTeam = [];
    }

    return {
        jobId: body.jobId,
        activityName: body.activityName,
        locationArea: body.locationArea || "",
        assignedTeam,
        plannedDate: body.plannedDate || "",
        completedDate: body.completedDate || "",
        status: body.status || "Pending",
        snagIssue: body.snagIssue || "",
        remarks: body.remarks || "",
    };
};

exports.listByJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        const result = await Installation.find({ jobId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            result,
        });
    } catch (error) {
        console.error("Installation listByJob error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch installation items",
            error: error.message,
        });
    }
};

exports.read = async (req, res) => {
    try {
        const result = await Installation.findById(req.params.id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Installation item not found",
            });
        }

        return res.status(200).json({
            success: true,
            result,
        });
    } catch (error) {
        console.error("Installation read error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to read installation item",
            error: error.message,
        });
    }
};

exports.create = async (req, res) => {
    try {
        const payload = normalizePayload(req.body);

        if (!payload.jobId) {
            return res.status(400).json({
                success: false,
                message: "jobId is required",
            });
        }

        if (!payload.activityName) {
            return res.status(400).json({
                success: false,
                message: "activityName is required",
            });
        }

        if (Job) {
            const job = await Job.findById(payload.jobId);
            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: "Job not found",
                });
            }

            if (!["Installation", "Closure"].includes(job.stage)) {
                job.stage = "Installation";
            }

            if (job.status !== "Active" && job.status !== "Completed") {
                job.status = "Active";
            }

            await job.save();
        }

        const result = await Installation.create(payload);

        return res.status(201).json({
            success: true,
            message: "Installation item created successfully",
            result,
        });
    } catch (error) {
        console.error("Installation create error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create installation item",
            error: error.message,
        });
    }
};

exports.update = async (req, res) => {
    try {
        const existing = await Installation.findById(req.params.id);

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Installation item not found",
            });
        }

        const payload = normalizePayload(req.body);

        if (!payload.jobId) {
            payload.jobId = existing.jobId;
        }

        const result = await Installation.findByIdAndUpdate(
            req.params.id,
            { $set: payload },
            { new: true, runValidators: true }
        );

        if (Job && payload.jobId) {
            const job = await Job.findById(payload.jobId);
            if (job) {
                job.stage = "Installation";
                if (job.status !== "Completed") {
                    job.status = "Active";
                }
                await job.save();
            }
        }

        return res.status(200).json({
            success: true,
            message: "Installation item updated successfully",
            result,
        });
    } catch (error) {
        console.error("Installation update error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update installation item",
            error: error.message,
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const result = await Installation.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Installation item not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Installation item deleted successfully",
        });
    } catch (error) {
        console.error("Installation delete error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete installation item",
            error: error.message,
        });
    }
};

exports.completeInstallation = async (req, res) => {
    try {
        const { jobId } = req.params;

        const items = await Installation.find({ jobId });

        if (!items.length) {
            return res.status(400).json({
                success: false,
                message: "No installation items found for this job",
            });
        }

        const incomplete = items.filter((item) => item.status !== "Completed");
        if (incomplete.length > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "All installation items must be Completed before marking installation complete",
            });
        }

        if (Job) {
            const job = await Job.findById(jobId);
            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: "Job not found",
                });
            }

            job.stage = "Closure";
            job.status = "Completed";
            await job.save();
        }

        return res.status(200).json({
            success: true,
            message: "Installation marked complete. Job moved to Closure",
        });
    } catch (error) {
        console.error("Installation complete error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to mark installation complete",
            error: error.message,
        });
    }
};