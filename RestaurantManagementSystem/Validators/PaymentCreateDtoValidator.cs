using FluentValidation;
using RestaurantManagementSystem.Models;

namespace RestaurantManagementSystem.Validators
{
    public class PaymentCreateDtoValidator : AbstractValidator<PaymentCreateDto>
    {
        public PaymentCreateDtoValidator()
        {
            RuleFor(x => x.OrderID)
                .GreaterThan(0)
                .WithMessage("Order ID must be a valid positive number");

            RuleFor(x => x.PaymentMode)
                .NotEmpty().WithMessage("Payment mode is required")
                .MaximumLength(20).WithMessage("Payment mode cannot exceed 20 characters")
                .Must(BeAValidPaymentMode)
                .WithMessage("Payment mode must be Cash, Card, UPI, or NetBanking");

            RuleFor(x => x.PaidAmount)
                .GreaterThan(0)
                .WithMessage("Paid amount must be greater than zero");
        }

        private bool BeAValidPaymentMode(string paymentMode)
        {
            var validModes = new[] { "Cash", "Card", "UPI", "NetBanking" };
            return validModes.Contains(paymentMode);
        }
    }
}
