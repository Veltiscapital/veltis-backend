import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../lib/utils/auth';
import { sendSuccess, sendError, parsePagination, parseStringParam } from '../../../lib/utils/api';
import { getConsultingBookings } from '../../../lib/db/supabase';

/**
 * Get consulting bookings for the authenticated user
 * 
 * @param req NextApiRequest
 * @param res NextApiResponse
 * @param userId The authenticated user's ID
 */
async function handler(req: NextApiRequest, res: NextApiResponse, userId: string) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    // Parse query parameters
    const { page, limit, offset } = parsePagination(req.query);
    const status = parseStringParam(req.query.status);

    // Get consulting bookings
    const bookings = await getConsultingBookings(userId);

    // Filter bookings by status if provided
    const filteredBookings = status
      ? bookings.filter((booking) => booking.status === status)
      : bookings;

    // Apply pagination
    const paginatedBookings = filteredBookings.slice(offset, offset + limit);

    // Return the bookings
    return sendSuccess(res, {
      bookings: paginatedBookings,
      pagination: {
        page,
        limit,
        total: filteredBookings.length,
        pages: Math.ceil(filteredBookings.length / limit),
      },
    });
  } catch (error) {
    console.error('Bookings error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

// Wrap the handler with authentication middleware
export default withAuth(handler);
