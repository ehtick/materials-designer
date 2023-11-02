import CodeMirror from "@exabyte-io/cove.js/dist/other/codemirror/CodeMirror";
import { Made } from "@exabyte-io/made.js";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";
import React from "react";

import { fetchPythonCode, transformationsMap } from "../../../pythonCodeMap";

const pyodideSource = "https://cdn.jsdelivr.net/pyodide/v0.24.0/full/pyodide.js";

class PythonTransformation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pythonCode: "",
            materials: props.materials,
            newMaterials: [],
            isLoading: false,
            transformationParameters: { transformationName: "default" },
        };
        this.handleCodeChange = this.handleCodeChange.bind(this);
        this.runPythonCode = this.runPythonCode.bind(this);
        this.handleRun = this.handleRun.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    UNSAFE_componentWillReceiveProps(prevProps) {
        const { materials, show } = this.props;
        if (prevProps.materials !== materials) {
            this.setState({ materials });
        }
        if (prevProps.show !== show) {
            this.setState({ isLoading: true });
            this.loadPythonCode();
            this.initializePyodide();
            this.setState({ isLoading: false });
        }
    }

    handleCodeChange(newContent) {
        this.setState({ pythonCode: newContent });
    }

    handleRun = async () => {
        try {
            const dataOut = await this.runPythonCode();
            const materials = dataOut.get("materials");
            const newMaterials = materials.map((m) => {
                const material = this.mapToObject(m);
                const config = Made.parsers.poscar.fromPoscar(material.poscar);
                const newMaterial = new Made.Material(config);
                newMaterial.metadata = material.metadata;

                return newMaterial;
            });

            this.setState({ newMaterials });
        } catch (error) {
            console.error(error);
        }
    };

    handleSubmit() {
        const { onSubmit } = this.props;
        const { newMaterials } = this.state;

        onSubmit(newMaterials);
    }

    loadPythonCode = async () => {
        const { transformationParameters } = this.state;
        const pythonCode = await fetchPythonCode(transformationParameters.transformationName);
        this.setState({ pythonCode });
    };

    handleTransformationParametersChange = async (event, newValue) => {
        if (newValue) {
            const pythonCode = await fetchPythonCode(newValue);
            this.setState({
                pythonCode,
                transformationParameters: { transformationName: newValue },
            });
        }
    };

    mapToObject(map) {
        const obj = {};
        map.forEach((value, key) => {
            if (value instanceof Map) {
                obj[key] = this.mapToObject(value);
            } else {
                obj[key] = value;
            }
        });
        return obj;
    }

    async initializePyodide() {
        if (!document.querySelector("[data-pyodide-script]")) {
            const script = document.createElement("script");
            script.src = pyodideSource;
            script.dataset.pyodideScript = "true";
            document.body.appendChild(script);

            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
            });
        }

        if (typeof window.loadPyodide === "undefined") {
            throw new Error("loadPyodide is not available. Please check the CDN URL.");
        }

        this.pyodide = await window.loadPyodide();

        await this.pyodide.loadPackage("micropip");
        // TODO: consider using CDN like jsDelivr above for distributing our python code
        const response = await fetch(
            "https://raw.githubusercontent.com/Exabyte-io/api-examples/48f86e29c069fc0205216c50b1b98c19634a6445/other/pyodide/imports.py",
        );
        const pythonCode = await response.text();
        await this.pyodide.runPythonAsync(pythonCode);

        document.pyodideMplTarget = document.getElementById("pyodide-plot-target");
    }

    async runPythonCode() {
        let dataOut = null;
        const { pythonCode, materials } = this.state;

        const materialsData = materials.map((material, id) => {
            const materialConfig = material.toJSON();
            const materialPoscar = material.getAsPOSCAR();
            return {
                id,
                material: materialConfig,
                poscar: materialPoscar,
                metadata: material.metadata,
            };
        });

        const dataIn = { materials: materialsData };
        const convertedData = this.pyodide.toPy({ data_in: dataIn, data_out: {} });
        try {
            const result = await this.pyodide.runPythonAsync(pythonCode, {
                globals: convertedData,
            });
            dataOut = (await result)
                ? result.toJs().get("data_out")
                : { content: "Nothing was returned from the Pyodide" };
            console.log("RESULT:", dataOut);
        } catch (error) {
            console.error("Error executing Python code:", error);
        }
        return dataOut;
    }

    render() {
        const { pythonCode, isLoading, transformationParameters, materials } = this.state;
        const { show, onHide } = this.props;
        const transformationNames = Object.keys(transformationsMap);

        return (
            <Dialog
                open={show}
                onClose={onHide}
                fullWidth
                maxWidth="lg"
                PaperProps={{ sx: { width: "60vw", height: "60vh", padding: "20px" } }}
            >
                <Box flexDirection="row">
                    <InputLabel sx={{ flexShrink: 0, marginRight: "16px" }}>
                        Available Materials:
                    </InputLabel>
                    <Box
                        id="available-materials"
                        display="flex"
                        flexDirection="row"
                        overflowX="auto"
                        gap={1}
                        sx={{
                            flex: "1",
                            alignItems: "center",
                            border: "1px solid grey",
                            borderRadius: "4px",
                        }}
                    >
                        {materials
                            ? materials.map((material) => (
                                  <Chip key={material.name} label={material.name} />
                              ))
                            : null}
                    </Box>
                </Box>
                <Box flexDirection="row" sx={{ alignItems: "center", gap: 2, mt: 2 }}>
                    <InputLabel sx={{ flexShrink: 0, marginRight: "16px" }}>
                        Transformations:
                    </InputLabel>
                    <Autocomplete
                        label="Transformation name:"
                        value={transformationParameters.transformationName}
                        getOptionLabel={(option) => option}
                        options={transformationNames}
                        onChange={this.handleTransformationParametersChange}
                        sx={{ flex: "1" }}
                        renderInput={(params) => (
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            <TextField {...params} label=" " />
                        )}
                    />
                </Box>

                <Box flexDirection="column" maxHeight={600} overflow="auto">
                    <CodeMirror
                        className="xyz-codemirror"
                        content={pythonCode}
                        updateContent={this.handleCodeChange}
                        readOnly={false}
                        rows={20}
                        options={{
                            lineNumbers: true,
                        }}
                        theme="dark"
                        completions={() => {}}
                        updateOnFirstLoad
                        language="python"
                    />
                </Box>

                <Box
                    flexDirection="row"
                    sx={{ justifyContent: "flex-end", gap: 2, mt: 2, width: "100%" }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={isLoading}
                        style={{ marginTop: "10px" }}
                        onClick={this.handleRun}
                    >
                        Run Code
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={isLoading}
                        style={{ marginTop: "10px" }}
                        onClick={this.handleSubmit}
                    >
                        Submit
                    </Button>
                </Box>
                <Box id="pyodide-plot-target" />
            </Dialog>
        );
    }
}

PythonTransformation.propTypes = {
    materials: PropTypes.array.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    transformationParameters: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
};

export default PythonTransformation;
