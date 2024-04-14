import JupyterLiteSession, {
    IMessageHandlerConfigItem,
} from "@exabyte-io/cove.js/dist/other/jupyterlite/JupyterLiteSession";
import { Action, MaterialSchema } from "@mat3ra/esse/dist/js/types";
import { Made } from "@mat3ra/made";
import { enqueueSnackbar } from "notistack";
import React from "react";

export interface BaseJupyterLiteProps {
    // eslint-disable-next-line react/no-unused-prop-types
    materials: Made.Material[];
    // eslint-disable-next-line react/no-unused-prop-types
    show: boolean;
    onMaterialsUpdate: (newMaterials: Made.Material[]) => void;
    // eslint-disable-next-line react/no-unused-prop-types
    onHide: () => void;
    // eslint-disable-next-line react/no-unused-prop-types
    title?: string;
    // eslint-disable-next-line react/no-unused-prop-types
    containerRef?: React.RefObject<HTMLDivElement>;
}

class BaseJupyterLiteSessionComponent<P = never, S = never> extends React.Component<
    P & BaseJupyterLiteProps,
    S
> {
    DEFAULT_NOTEBOOK_PATH = "api-examples/other/materials_designer/Introduction.ipynb";

    jupyterLiteSessionRef = React.createRef<JupyterLiteSession>();

    componentDidUpdate(prevProps: P & BaseJupyterLiteProps, prevState: S) {
        const { materials } = this.props;
        if (prevProps.materials !== materials) {
            this.sendMaterials();
        }
    }

    sendMaterials = () => {
        const materialsData = this.getMaterialsForMessage();
        this.jupyterLiteSessionRef.current?.sendData(materialsData);
    };

    getMaterialsForMessage = () => {
        const materials = this.getMaterialsToUse();
        return materials.map((material) => material.toJSON());
    };

    getMaterialsToUse = () => {
        const { materials } = this.props;
        return materials;
    };

    validateMaterialConfigs = (configs: MaterialSchema[]) => {
        const validationErrors: string[] = [];
        const validatedMaterials = configs.reduce((validMaterials, config) => {
            try {
                const material = new Made.Material(config);
                material.validate();
                validMaterials.push(material);
            } catch (e: any) {
                validationErrors.push(`Failed to create material ${config.name}: ${e.message}`);
            }
            return validMaterials;
        }, [] as Made.Material[]);
        return { validatedMaterials, validationErrors };
    };

    handleSetMaterials = (data: any) => {
        const configs = data.materials as MaterialSchema[];
        if (Array.isArray(configs)) {
            const { validatedMaterials, validationErrors } = this.validateMaterialConfigs(configs);
            this.setMaterials(validatedMaterials);
            validationErrors.forEach((errorMessage) => {
                enqueueSnackbar(errorMessage, { variant: "error" });
            });
        } else {
            enqueueSnackbar("Invalid material data received", { variant: "error" });
        }
    };

    // eslint-disable-next-line react/sort-comp
    messageHandlerConfigs: IMessageHandlerConfigItem[] = [
        {
            action: Action.setData,
            handlers: [this.handleSetMaterials],
        },
        {
            action: Action.getData,
            handlers: [this.getMaterialsForMessage],
        },
    ];

    setMaterials = (materials: Made.Material[]): void => {
        const { onMaterialsUpdate } = this.props;
        onMaterialsUpdate(materials);
    };

    render() {
        return (
            <JupyterLiteSession
                defaultNotebookPath={this.DEFAULT_NOTEBOOK_PATH}
                messageHandlerConfigs={this.messageHandlerConfigs}
                ref={this.jupyterLiteSessionRef}
            />
        );
    }
}

export default BaseJupyterLiteSessionComponent;
