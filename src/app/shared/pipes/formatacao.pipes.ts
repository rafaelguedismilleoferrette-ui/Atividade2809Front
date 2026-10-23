import { Pipe, PipeTransform } from '@angular/core';
import { formatarCep, formatarDocumento, formatarTelefone } from '../utils/documentos';

/** `{{ cliente.cpfCnpj | documento }}` → 529.982.247-25 / 11.222.333/0001-81 */
@Pipe({ name: 'documento' })
export class DocumentoPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    return formatarDocumento(valor);
  }
}

/** `{{ cliente.telefone | telefone }}` → (45) 99999-0000 */
@Pipe({ name: 'telefone' })
export class TelefonePipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    return formatarTelefone(valor);
  }
}

/** `{{ cliente.cep | cep }}` → 85810-000 */
@Pipe({ name: 'cep' })
export class CepPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    return formatarCep(valor);
  }
}
