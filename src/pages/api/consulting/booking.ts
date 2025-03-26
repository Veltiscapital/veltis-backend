import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/utils/auth';
import { sendSuccess, sendError, validateRequiredFields } from '../../../lib/utils/api';
import { createConsultingBooking } from '../../../lib/db/supabase';

/**
 * Book a consultation
 * 
 * @param req NextApiRequest
 * @param res NextApiResponse
 * @param userId The authenticated user's ID
 */
async function handler(req: NextApiRequest, res: NextApiResponse, userId: string) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    // Get the booking data from the request body
    const { serviceType, description, scheduledAt } = req.body;

    // Validate required fields
    const requiredFields = ['serviceType', 'description', 'scheduledAt'];
    const validationError = validateRequiredFields(req.body, requiredFields);
    if (validationError) {
      return sendError(res, validationError, 400);
    }

    // Validate the scheduled date
    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return sendError(res, 'Invalid scheduled date', 400);
    }

    // Check if the scheduled date is in the future
    if (scheduledDate <= new Date()) {
      return sendError(res, 'Scheduled date must be in the future', 400);
    }

    // Create the booking
    const booking = await createConsultingBooking({
      client_id: userId,
      service_type: serviceType,
      description,
      scheduled_at: scheduledAt,
    });

    // Return the booking
    return sendSuccess(res, {
      booking,
      message: 'Consultation booked successfully',
    });
  } catch (error) {
    console.error('Booking error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

// Wrap the handler with authentication middleware
export default withAuth(handler);
