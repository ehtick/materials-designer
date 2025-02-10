import { MaterialSchema } from "@mat3ra/esse/dist/js/types";
import React from "react";
import { Material } from "../../material";
interface StandataImportDialogProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (materials: Material[]) => void;
    defaultMaterialConfigs: MaterialSchema[];
}
interface StandataImportDialogState {
    selectedMaterialConfigs: MaterialSchema[];
}
declare class StandataImportDialog extends React.Component<StandataImportDialogProps, StandataImportDialogState> {
    constructor(props: StandataImportDialogProps);
    handleMaterialSelect: (materialConfigs: MaterialSchema[] | []) => void;
    handleRemoveMaterial: (index: number) => void;
    addMaterials: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default StandataImportDialog;
