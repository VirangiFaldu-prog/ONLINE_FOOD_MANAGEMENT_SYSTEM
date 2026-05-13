using FluentValidation;
using RestaurantManagementSystem.Models;

namespace RestaurantManagementSystem.Validators
{
    public class MenuItemCreateDtoValidator : AbstractValidator<MenuItemCreateDto>
    {
        public MenuItemCreateDtoValidator()
        {
            RuleFor(x => x.CategoryID)
                .GreaterThan(0)
                .WithMessage("CategoryID must be a valid positive number");

            RuleFor(x => x.MenuItemName)
                .NotEmpty()
                .WithMessage("Menu item name is required")
                .MaximumLength(100)
                .WithMessage("Menu item name cannot exceed 100 characters");

            RuleFor(x => x.MenuItemPrice)
                .GreaterThan(0)
                .WithMessage("Menu item price must be greater than zero")
                .LessThanOrEqualTo(10000)
                .WithMessage("Menu item price seems unrealistic");
        }
    }
}
