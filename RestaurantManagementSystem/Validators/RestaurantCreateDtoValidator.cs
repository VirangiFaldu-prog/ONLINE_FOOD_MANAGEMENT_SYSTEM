using FluentValidation;
using RestaurantManagementSystem.Models;

namespace RestaurantManagementSystem.Validators
{
    public class RestaurantCreateDtoValidator : AbstractValidator<RestaurantCreateDto>
    {
        public RestaurantCreateDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Restaurant name is required")
                .MaximumLength(100).WithMessage("Restaurant name cannot exceed 100 characters");

            RuleFor(x => x.Address)
                .NotEmpty().WithMessage("Address is required")
                .MaximumLength(200).WithMessage("Address cannot exceed 200 characters");

            RuleFor(x => x.City)
                .NotEmpty().WithMessage("City is required")
                .MaximumLength(50).WithMessage("City cannot exceed 50 characters")
                .Matches("^[a-zA-Z ]+$")
                .WithMessage("City name must contain only letters");
        }
    }
}
