using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantManagementSystem.Data;
using RestaurantManagementSystem.Models;
using System.Security.Claims;

namespace RestaurantManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly RestaurantManagementContext _context;

        public PaymentController(RestaurantManagementContext context)
        {
            _context = context;
        }

        #region Helper Methods
        private int GetUserId() =>
            int.Parse(User.FindFirst("UserID")?.Value ?? "0");

        private string GetUserRole() =>
            User.FindFirst(ClaimTypes.Role)?.Value;
        #endregion

        #region GetAllPayments
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllPayments()
        {
            var payments = await _context.Payments
                .Include(p => p.Order)
                .ToListAsync();

            return Ok(payments);
        }
        #endregion

        #region GetPaymentById
        [Authorize(Roles = "Admin,Restaurant,Customer")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPaymentById(int id)
        {
            int userId = GetUserId();
            string role = GetUserRole();

            if (userId == 0)
                return Unauthorized("Invalid token");

            var payment = await _context.Payments
                .Include(p => p.Order)
                .FirstOrDefaultAsync(p => p.PaymentID == id);

            if (payment == null)
                return NotFound("Payment not found");

            if (role == "Customer" && payment.Order.UserID != userId)
                return Forbid("You can access only your own payments");

            if (role == "Restaurant" && payment.Order.RestaurantID == null)
                return Forbid("You are not allowed to access this payment");

            return Ok(payment);
        }
        #endregion

        #region GetPaymentsByOrder
        [Authorize(Roles = "Admin,Customer,Restaurant")]
        [HttpGet("order/{orderId}")]
        public async Task<IActionResult> GetPaymentsByOrder(int orderId)
        {
            int userId = GetUserId();
            string role = GetUserRole();

            if (userId == 0)
                return Unauthorized("Invalid token");

            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                return NotFound("Order not found");

            if (role == "Customer" && order.UserID != userId)
                return Forbid("You can view payments only for your orders");

            if (role == "Restaurant" && order.RestaurantID == null)
                return Forbid("You are not allowed to view this order payment");

            var payments = await _context.Payments
                .Where(p => p.OrderID == orderId)
                .ToListAsync();

            return Ok(payments);
        }
        #endregion

        #region CreatePayment
        [Authorize(Roles = "Customer")]
        [HttpPost]
        public async Task<IActionResult> CreatePayment([FromBody] PaymentCreateDto dto)
        {
            int userId = GetUserId();
            if (userId == 0)
                return Unauthorized("Invalid token");

            var order = await _context.Orders.FindAsync(dto.OrderID);
            if (order == null)
                return NotFound("Order not found");

            if (order.UserID != userId)
                return Forbid("You can pay only for your own order");

            bool alreadyPaid = await _context.Payments
                .AnyAsync(p => p.OrderID == dto.OrderID);

            if (alreadyPaid)
                return BadRequest("Payment already exists for this order");

            var payment = new Payment
            {
                OrderID = dto.OrderID,
                PaymentMode = dto.PaymentMode,
                PaidAmount = dto.PaidAmount,
                PaymentStatus = "Pending"
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Payment created successfully",
                PaymentID = payment.PaymentID
            });
        }
        #endregion

        #region UpdatePaymentStatus
        [Authorize(Roles = "Restaurant")]
        [HttpPatch("{paymentId}/status")]
        public async Task<IActionResult> UpdatePaymentStatus(
            int paymentId,
            [FromQuery] string status)
        {
            var validStatuses = new[] { "Pending", "Completed", "Failed" };
            if (!validStatuses.Contains(status))
                return BadRequest("Invalid payment status");

            var payment = await _context.Payments
                .Include(p => p.Order)
                .FirstOrDefaultAsync(p => p.PaymentID == paymentId);

            if (payment == null)
                return NotFound("Payment not found");

            // Optional: verify restaurant owns the order
            if (payment.Order.RestaurantID == null)
                return Forbid("You cannot update this payment");

            payment.PaymentStatus = status;
            await _context.SaveChangesAsync();

            return Ok("Payment status updated successfully");
        }
        #endregion

        #region DeletePayment
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePayment(int id)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null)
                return NotFound("Payment not found");

            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();

            return Ok("Payment deleted successfully");
        }
        #endregion
    }
}

