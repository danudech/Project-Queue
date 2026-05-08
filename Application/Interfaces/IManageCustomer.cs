
using Queue.Application.DTO.Request;
using Queue.Application.DTO.Response;
using Queue.Domain.Entities;

namespace Queue.Application.Interfaces;

public interface IManageCustomer
{
    Task<List<CustomerResponse>> GetCustomerById(int userId, string ip, string userAgent, CancellationToken ct);
    Task<CustomerResponse> CreateCustomer(int userId, CustomerRequest request, string ip, string userAgent, CancellationToken ct);
    Task<CustomerResponse> UpdateCustomer(int userId, CustomerRequest request, string ip, string userAgent, CancellationToken ct);
    Task DeleteCustomer(int userId, int customerId, string ip, string userAgent, CancellationToken ct);
    Task<List<CustomerTag>> GetCustomerTagsById(int userId, string ip, string userAgent, CancellationToken ct);
}
