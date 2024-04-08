import PyodideLoader from "@exabyte-io/cove.js/dist/other/pyodide";
import Dialog from "@mui/material/Dialog";
import PropTypes from "prop-types";
import React from "react";
class PythonTransformation extends React.Component {
    constructor(props) {
        super(props);
        this.onLoad = (pyodideInstance) => {
            this.setState({ pyodide: pyodideInstance });
        };
        this.state = {
            pyodide: null,
        };
    }
    render() {
        const { show, onHide } = this.props;
        return (React.createElement(React.Fragment, null,
            React.createElement(PyodideLoader, { onLoad: this.onLoad, triggerLoad: show }),
            React.createElement(Dialog, { open: show, onClose: onHide, fullWidth: true, maxWidth: "lg", PaperProps: { sx: { width: "60vw", height: "60vh", padding: "20px" } } },
                React.createElement("div", null, this.state.pyodide ? "Pyodide is loaded" : "Pyodide is not loaded"))));
    }
}
PythonTransformation.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
};
export default PythonTransformation;
