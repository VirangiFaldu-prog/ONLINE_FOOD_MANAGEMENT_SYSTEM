using FluentValidation;
using RestaurantManagementSystem.Models;

namespace RestaurantManagementSystem.Validators
{
    public class DeliveryUpdateDtoValidator : AbstractValidator<DeliveryUpdateDto>
    {
        public DeliveryUpdateDtoValidator()
        {
            RuleFor(x => x.DeliveryStatus)
                .NotEmpty()
                .WithMessage("Delivery status is required")
                .MaximumLength(20)
                .WithMessage("Delivery status cannot exceed 20 characters")
                .Must(BeAValidStatus)
                .WithMessage("Delivery status must be one of: Assigned, OutForDelivery, Delivered, Cancelled");
        }

        private bool BeAValidStatus(string status)
        {
            var validStatuses = new[] { "Assigned", "OutForDelivery", "Delivered", "Cancelled" };
            return validStatuses.Contains(status);
        }
    }
}
