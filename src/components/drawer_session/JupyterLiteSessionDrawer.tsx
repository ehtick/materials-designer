import MessageHandler from "@exabyte-io/cove.js/dist/other/iframe-messaging";
import JupyterLiteSession from "@exabyte-io/cove.js/dist/other/jupyterlite/JupyterLiteSession";
import { Made } from "@exabyte-io/made.js";
import { MaterialSchema } from "@mat3ra/esse/lib/js/types";
import { enqueueSnackbar } from "notistack";
import React from "react";
import ResizableDrawer from "temp_cove/ResizableDrawer";

import { theme } from "../../settings";

interface JupyterLiteTransformationProps {
    materials: Made.Material[];
    show: boolean;
    onSubmit: (newMaterials: Made.Material[]) => void;
    onHide: () => void;
}

const DEFAULT_NOTEBOOK_PATH = "api-examples/other/materials_designer/Introduction.ipynb";

class JupyterLiteSessionDrawer extends React.Component<JupyterLiteTransformationProps> {
    messageHandler = new MessageHandler();

    // eslint-disable-next-line no-useless-constructor
    constructor(props: JupyterLiteTransformationProps) {
        super(props);
    }

    componentDidMount() {
        this.messageHandler.addHandlers("set-data", [this.handleSetMaterials]);
        this.messageHandler.addHandlers("get-data", [this.returnSelectedMaterials]);
    }

    componentDidUpdate(prevProps: JupyterLiteTransformationProps) {
        // const { materials } = this.props;
        // if (prevProps.materials !== materials) {
        //     // eslint-disable-next-line react/no-did-update-set-state
        // }
        this.messageHandler.sendData(this.returnSelectedMaterials());
    }

    returnSelectedMaterials = () => {
        const { materials } = this.props;
        return materials.map((material) => material.toJSON());
    };

    validateMaterialConfigs = (configs: MaterialSchema[]) => {
        const validationErrors: string[] = [];
        const validatedMaterials = configs.reduce((validMaterials, config) => {
            try {
                const material = new Made.Material(config);
                material.validate();
                validMaterials.push(material);
            } catch (e: any) {
                validationErrors.push(
                    `Failed to create material ${config.name}: ${JSON.stringify(
                        e.details.error[0],
                    )}`,
                );
            }
            return validMaterials;
        }, [] as Made.Material[]);
        return { validatedMaterials, validationErrors };
    };

    handleSetMaterials = (data: any) => {
        const { onSubmit } = this.props;
        const configs = data.materials as MaterialSchema[];
        if (Array.isArray(configs)) {
            const { validatedMaterials, validationErrors } = this.validateMaterialConfigs(configs);

            onSubmit(validatedMaterials);

            validationErrors.forEach((errorMessage) => {
                enqueueSnackbar(errorMessage, { variant: "error" });
            });
        } else {
            enqueueSnackbar("Invalid material data received", { variant: "error" });
        }
    };

    render() {
        const { show, onHide } = this.props;
        return (
            <div style={{ display: show ? "block" : "none" }}>
                <ResizableDrawer open={show} onClose={onHide}>
                    <JupyterLiteSession
                        originURL="https://jupyterlite.mat3ra.com"
                        defaultNotebookPath={DEFAULT_NOTEBOOK_PATH}
                        messageHandler={this.messageHandler}
                    />
                </ResizableDrawer>
            </div>
        );
    }
}

export default JupyterLiteSessionDrawer;
