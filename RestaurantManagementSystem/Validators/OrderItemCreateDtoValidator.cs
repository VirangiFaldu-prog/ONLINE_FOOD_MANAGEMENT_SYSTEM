using FluentValidation;
using RestaurantManagementSystem.Models;

namespace RestaurantManagementSystem.Validators
{
    public class OrderItemCreateDtoValidator : AbstractValidator<OrderItemCreateDto>
    {
        public OrderItemCreateDtoValidator()
        {
            RuleFor(x => x.MenuItemID)
                .GreaterThan(0)
                .WithMessage("MenuItemID must be a valid positive number");

            RuleFor(x => x.Quantity)
                .GreaterThan(0)
                .WithMessage("Quantity must be at least 1")
                .LessThanOrEqualTo(20)
                .WithMessage("Quantity cannot exceed 20 items");
        }
    }
}
