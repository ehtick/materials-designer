import { jsx as _jsx } from "react/jsx-runtime";
import JupyterLiteSession from "@exabyte-io/cove.js/dist/other/jupyterlite/JupyterLiteSession";
import { Made } from "@mat3ra/made";
import { enqueueSnackbar } from "notistack";
import React from "react";
class BaseJupyterLiteSessionComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.DEFAULT_NOTEBOOK_PATH = "api-examples/other/materials_designer/Introduction.ipynb";
        this.jupyterLiteSessionRef = React.createRef();
        this.sendMaterials = () => {
            var _a;
            const materialsData = this.getMaterialsForMessage();
            (_a = this.jupyterLiteSessionRef.current) === null || _a === void 0 ? void 0 : _a.sendData(materialsData);
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
        // eslint-disable-next-line react/sort-comp
        this.messageHandlerConfigs = [
            {
                action: "set-data",
                handlers: [this.handleSetMaterials],
            },
            {
                action: "get-data",
                handlers: [this.getMaterialsForMessage],
            },
        ];
        this.setMaterials = (materials) => {
            const { onMaterialsUpdate } = this.props;
            onMaterialsUpdate(materials);
        };
    }
    componentDidUpdate(prevProps, prevState) {
        const { materials } = this.props;
        if (prevProps.materials !== materials) {
            this.sendMaterials();
        }
    }
    render() {
        return (_jsx(JupyterLiteSession
        // originURL="http://localhost:8000"
        , { 
            // originURL="http://localhost:8000"
            defaultNotebookPath: this.DEFAULT_NOTEBOOK_PATH, messageHandlerConfigs: this.messageHandlerConfigs, ref: this.jupyterLiteSessionRef }));
    }
}
export default BaseJupyterLiteSessionComponent;
