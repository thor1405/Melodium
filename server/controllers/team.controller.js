import TeamMember from '../models/TeamMember.js';

// @desc    Get all team members grouped or filtered by category
// @route   GET /api/team
// @access  Public
export const getTeamMembers = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };

    if (category && category !== 'ALL') query.category = category;

    const members = await TeamMember.find(query).sort({ order: 1, createdAt: 1 });

    res.json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new team member
// @route   POST /api/team
// @access  Private (Admin)
export const createTeamMember = async (req, res, next) => {
  try {
    const member = await TeamMember.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Team member added successfully.',
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update team member
// @route   PUT /api/team/:id
// @access  Private (Admin)
export const updateTeamMember = async (req, res, next) => {
  try {
    const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found.',
      });
    }

    res.json({
      success: true,
      message: 'Team member updated.',
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete team member
// @route   DELETE /api/team/:id
// @access  Private (Admin)
export const deleteTeamMember = async (req, res, next) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found.',
      });
    }

    res.json({
      success: true,
      message: 'Team member removed.',
    });
  } catch (error) {
    next(error);
  }
};
