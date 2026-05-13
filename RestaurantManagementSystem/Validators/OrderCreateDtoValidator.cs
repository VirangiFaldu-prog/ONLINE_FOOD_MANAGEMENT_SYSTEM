using FluentValidation;
using RestaurantManagementSystem.Models;

namespace RestaurantManagementSystem.Validators
{
    public class OrderCreateDtoValidator : AbstractValidator<OrderCreateDto>
    {
        public OrderCreateDtoValidator()
        {
            RuleFor(x => x.RestaurantID)
                .GreaterThan(0)
                .WithMessage("RestaurantID must be a valid positive number");

            RuleFor(x => x.Items)
                .NotNull()
                .WithMessage("Order must contain at least one item")
                .Must(items => items.Count > 0)
                .WithMessage("Order must contain at least one item");

            RuleForEach(x => x.Items)
                .SetValidator(new OrderItemCreateDtoValidator());
        }
    }
}
