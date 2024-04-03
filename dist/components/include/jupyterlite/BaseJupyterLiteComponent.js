import { jsx as _jsx } from "react/jsx-runtime";
import MessageHandler from "@exabyte-io/cove.js/dist/other/iframe-messaging";
import JupyterLiteSession from "@exabyte-io/cove.js/dist/other/jupyterlite/JupyterLiteSession";
import { Made } from "@mat3ra/made";
import { enqueueSnackbar } from "notistack";
import React from "react";
class BaseJupyterLiteSessionComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.messageHandler = new MessageHandler();
        this.DEFAULT_NOTEBOOK_PATH = "api-examples/other/materials_designer/Introduction.ipynb";
        this.sendMaterials = () => {
            const materialsData = this.getMaterialsForMessage();
            this.messageHandler.sendData(materialsData);
        };
        this.getMaterialsForMessage = () => {
            const materials = this.getMaterialsToUse();
            return materials.map((material) => material.toJSON());
        };
        this.getMaterialsToUse = () => {
            const { materials } = this.props;
            return materials;
        };
        this.validateMaterialConfigs = (configs) => {
            const validationErrors = [];
            const validatedMaterials = configs.reduce((validMaterials, config) => {
                try {
                    const material = new Made.Material(config);
                    material.validate();
                    validMaterials.push(material);
                }
                catch (e) {
                    validationErrors.push(`Failed to create material ${config.name}: ${e.message}`);
                }
                return validMaterials;
            }, []);
            return { validatedMaterials, validationErrors };
        };
        this.handleSetMaterials = (data) => {
            const configs = data.materials;
            if (Array.isArray(configs)) {
                const { validatedMaterials, validationErrors } = this.validateMaterialConfigs(configs);
                this.setMaterials(validatedMaterials);
                validationErrors.forEach((errorMessage) => {
                    enqueueSnackbar(errorMessage, { variant: "error" });
                });
            }
            else {
                enqueueSnackbar("Invalid material data received", { variant: "error" });
            }
        };
        this.setMaterials = (materials) => {
            const { onMaterialsUpdate } = this.props;
            onMaterialsUpdate(materials);
        };
    }
    componentDidMount() {
        this.messageHandler.addHandlers("set-data", [this.handleSetMaterials]);
        this.messageHandler.addHandlers("get-data", [this.getMaterialsForMessage]);
    }
    componentDidUpdate(prevProps, prevState) {
        const { materials } = this.props;
        if (prevProps.materials !== materials) {
            this.sendMaterials();
        }
    }
    componentWillUnmount() {
        this.messageHandler.destroy();
    }
    render() {
        return (_jsx(JupyterLiteSession, { defaultNotebookPath: this.DEFAULT_NOTEBOOK_PATH, messageHandler: this.messageHandler }));
    }
}
export default BaseJupyterLiteSessionComponent;
