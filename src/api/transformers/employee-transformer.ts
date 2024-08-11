import { Employee } from '@/types/employee';
import { RecordModel } from 'pocketbase';

export class EmployeeTransformer {
  static transform(apiEmployee: RecordModel): Employee {
    return {
      id: apiEmployee.id,
      name: apiEmployee.name,
      isPermanent: apiEmployee.is_permanent,
      isActive: apiEmployee.is_active,
      weight: apiEmployee.weight,
      updated: new Date(apiEmployee.updated),
    };
  }
}
