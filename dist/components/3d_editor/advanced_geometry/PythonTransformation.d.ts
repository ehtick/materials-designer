export default PythonTransformation;
declare class PythonTransformation extends React.Component<any, any, any> {
    constructor(props: any);
    state: {
        pyodide: null;
    };
    onLoad: (pyodideInstance: any) => void;
    render(): React.JSX.Element;
}
declare namespace PythonTransformation {
    namespace propTypes {
        const show: PropTypes.Validator<boolean>;
        const onHide: PropTypes.Validator<(...args: any[]) => any>;
    }
}
import React from "react";
import PropTypes from "prop-types";
