/** Resolve rental window from request payload */
function resolveRentalWindow({ rentalDuration, startDate, endDate, startDateTime, endDateTime }) {
  const reqStart = startDateTime ? new Date(startDateTime) : new Date(startDate);
  let reqEnd = endDateTime ? new Date(endDateTime) : new Date(endDate);

  if (rentalDuration === '3_hours' && startDateTime && !endDateTime) {
    reqEnd = new Date(reqStart.getTime() + 3 * 60 * 60 * 1000);
  }

  if (reqStart > reqEnd) {
    throw new Error('End must be after start');
  }

  return { reqStart, reqEnd };
}

function bookingWindow(booking) {
  const reqStart = booking.startDateTime ? new Date(booking.startDateTime) : new Date(booking.startDate);
  const reqEnd = booking.endDateTime ? new Date(booking.endDateTime) : new Date(booking.endDate);
  return { reqStart, reqEnd };
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart <= bEnd && aEnd >= bStart;
}

function isActiveBooking(booking) {
  return (
    booking.orderStatus !== 'COMPLETED' &&
    booking.depositStatus !== 'FORFEITED_DAMAGE' &&
    booking.paymentStatus !== 'REFUNDED'
  );
}

function hostBlockOverlaps(product, reqStart, reqEnd) {
  if (!product.hostAvailabilityBlocks?.length) return null;
  for (const block of product.hostAvailabilityBlocks) {
    if (!block.startDate || !block.endDate) continue;
    const bStart = new Date(block.startDate);
    const bEnd = new Date(block.endDate);
    if (rangesOverlap(reqStart, reqEnd, bStart, bEnd)) {
      return block;
    }
  }
  return null;
}

module.exports = {
  resolveRentalWindow,
  bookingWindow,
  rangesOverlap,
  isActiveBooking,
  hostBlockOverlaps
};
