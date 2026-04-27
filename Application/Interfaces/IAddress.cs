
using Queue.Application.DTO.Response;
using Queue.Domain.Entities;

namespace Queue.Application.Interfaces;

public interface IAddress
{
    Task<List<AddressResponse>?> GetAddressByZipcode(string zipcode, string ip, string userAgent, CancellationToken ct);
}
