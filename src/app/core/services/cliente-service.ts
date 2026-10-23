import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cliente, ClientePayload } from '../models/cliente.model';

/**
 * Comunicação com o `ClienteController` do backend.
 *
 * `@Service()` é o decorator de serviços do Angular 22: registra a classe no
 * injetor raiz automaticamente (equivalente a `@Injectable({ providedIn: 'root' })`).
 */
@Service()
export class ClienteService {
  private readonly chamadaHttp = inject(HttpClient);

  readonly urlCliente = `${environment.apiUrl}/clientes`;

  listarClientes(): Observable<Cliente[]> {
    return this.chamadaHttp.get<Cliente[]>(`${this.urlCliente}/listar-clientes`);
  }

  buscarClientePorId(id: number): Observable<Cliente> {
    return this.chamadaHttp.get<Cliente>(`${this.urlCliente}/buscar-cliente/${id}`);
  }

  salvarCliente(cliente: ClientePayload): Observable<Cliente> {
    return this.chamadaHttp.post<Cliente>(`${this.urlCliente}/salvar-cliente`, cliente);
  }

  atualizarCliente(id: number, cliente: ClientePayload): Observable<Cliente> {
    return this.chamadaHttp.put<Cliente>(`${this.urlCliente}/atualizar-cliente/${id}`, cliente);
  }

  deletarCliente(id: number): Observable<void> {
    return this.chamadaHttp.delete<void>(`${this.urlCliente}/deletar-cliente/${id}`);
  }
}
