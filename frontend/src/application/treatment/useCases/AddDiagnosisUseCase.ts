import type {AddDiagnosisCommand} from "../commands";
import type {Diagnosis} from "@/domain/treatment/entities";
import {buildTreatmentLocation} from "@/domain/treatment/services";

export class AddDiagnosisUseCase {
  execute(command: AddDiagnosisCommand, now: Date = new Date()): Diagnosis {
    return {
      id: this.buildId(command, now),
      clinicId: command.clinicId,
      patientId: command.patientId,
      diagnosis: command.diagnosis,
      location: buildTreatmentLocation(command),
      severity: command.severity,
      certainty: command.certainty,
      status: command.status,
      evidence: command.evidence,
      attachmentIds: command.attachmentIds,
      symptoms: command.symptoms,
      painLevel: command.painLevel,
      notes: command.notes?.trim() || undefined,
      createdAt: now,
      createdBy: command.providerId,
    };
  }

  private buildId(command: AddDiagnosisCommand, now: Date): string {
    if (command.mouthRegionId || command.selectedTeeth.length === 0) {
      return `d_${now.getTime()}_gen`;
    }
    if (command.selectedTeeth.length > 1) return `d_${now.getTime()}_group`;
    return `d_${now.getTime()}_${command.selectedTeeth[0]}`;
  }
}
