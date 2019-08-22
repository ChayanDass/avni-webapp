import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { FormControl, Input, InputLabel, Select } from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import axios from "axios";
import DownshiftMultiple from "./AutoComplete";
import { Redirect } from "react-router-dom";
import FormHelperText from "@material-ui/core/FormHelperText";

class NewFormModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      formType: "",
      programName: "",
      subjectType: "",
      encounterType: [],
      open: false,
      onClose: false,
      data: {},
      toFormDetails: "",
      errors: { name: "", formType: "", programName: "", subjectType: "", encounterType: "" }
    };
    this.handleClickOpen = this.handleClickOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  validateForm() {
    let errorsList = {};
    if (this.state.name === "") errorsList["name"] = "Please enter form name.";
    if (this.state.formType === "") errorsList["formType"] = "Please select form type.";
    if (this.state.subjectType === "") errorsList["subjectType"] = "Please select subject type.";
    if (
      (this.state.formType === "ProgramEncounter" ||
        this.state.formType === "ProgramExit" ||
        this.state.formType === "ProgramEnrolment") &&
      this.state.programName === ""
    )
      errorsList["programName"] = "Please select program name.";
    if (
      (this.state.formType === "Encounter" || this.state.formType === "ProgramEncounter") &&
      this.state.encounterType.length === 0
    )
      errorsList["encounterType"] = "Please select atleast one encounter type.";

    this.setState({
      errors: errorsList
    });

    let errorFlag = true;
    if (Object.keys(errorsList).length > 0) errorFlag = false;
    return errorFlag;
  }
  addFields() {
    if (this.validateForm()) {
      let dataSend = {
        name: this.state.name,
        formType: this.state.formType,
        subjectType: this.state.subjectType
      };
      dataSend["programName"] = this.state.programName;
      dataSend["encounterTypes"] = this.state.encounterType;
      axios
        .post("/web/forms", dataSend)
        .then(response => {
          this.setState({
            toFormDetails: response.data.uuid
          });
        })
        .catch(error => {
          this.setState({ errorMsg: error.response.data });
        });
    }
  }

  componentDidMount() {
    axios
      .get("/web/operationalModules")
      .then(response => {
        let data = Object.assign({}, response.data);
        delete data["formMappings"];
        this.setState({
          data: data
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  onChangeField(event) {
    this.setState(Object.assign({}, this.state, { [event.target.name]: event.target.value }));
  }

  onChangeEncounterField(encounterTypes) {
    this.setState(Object.assign({}, this.state, { encounterTypes: encounterTypes }));
  }

  handleClickOpen() {
    this.setState({
      formType: "",
      subjectType: "",
      programName: "",
      encounterType: "",
      open: true
    });
  }

  handleClose() {
    this.setState({ open: false });
  }

  NewFormButton() {
    return (
      <div style={{ textAlign: "right" }}>
        <Button variant="outlined" color="secondary" onClick={this.handleClickOpen}>
          {" "}
          New Form{" "}
        </Button>
      </div>
    );
  }

  getDownshiftValue(encounterTypeValue) {
    this.setState({ encounterType: encounterTypeValue });
  }

  programNameElement() {
    return (
      <FormControl fullWidth margin="dense">
        <InputLabel htmlFor="programName">Program Name</InputLabel>
        <Select
          id="programName"
          name="programName"
          value={this.state.programName}
          onChange={this.onChangeField.bind(this)}
        >
          {this.state.data.programs.map(program => (
            <MenuItem key={program.operationalProgramName} value={program.operationalProgramName}>
              {program.operationalProgramName}
            </MenuItem>
          ))}
        </Select>
        {this.state.errors.programName && (
          <FormHelperText error>{this.state.errors.programName}</FormHelperText>
        )}
      </FormControl>
    );
  }

  subjectTypeElement() {
    return (
      <FormControl fullWidth margin="dense">
        <InputLabel htmlFor="subjectType">Subject Type</InputLabel>
        <Select
          id="subjectType"
          name="subjectType"
          value={this.state.subjectType}
          onChange={this.onChangeField.bind(this)}
        >
          {this.state.data.subjectTypes != null &&
            this.state.data.subjectTypes.map(subjectType => (
              <MenuItem
                key={subjectType.operationalSubjectTypeName}
                value={subjectType.operationalSubjectTypeName}
              >
                {subjectType.operationalSubjectTypeName}
              </MenuItem>
            ))}
        </Select>
        {this.state.errors.subjectType && (
          <FormHelperText error>{this.state.errors.subjectType}</FormHelperText>
        )}
      </FormControl>
    );
  }

  encounterTypesElement() {
    let encounterTypesValues =
      this.state.data.encounterTypes != null
        ? this.state.data.encounterTypes.map(encounterType => ({
            label: encounterType.operationalEncounterTypeName
          }))
        : [];
    return (
      <FormControl fullWidth margin="dense">
        <DownshiftMultiple
          id="ecounterTypes"
          suggestions={encounterTypesValues}
          OnGetSelectedValue={this.getDownshiftValue.bind(this)}
        />
        {this.state.errors.ecounterType && (
          <FormHelperText error>{this.state.errors.ecounterType}</FormHelperText>
        )}
      </FormControl>
    );
  }

  render() {
    if (this.state.toFormDetails !== "") {
      return <Redirect to={"/forms/" + this.state.toFormDetails} />;
    }
    const encounterTypes =
      this.state.formType === "Encounter" || this.state.formType === "ProgramEncounter";
    const programBased =
      this.state.formType === "ProgramEncounter" ||
      this.state.formType === "ProgramExit" ||
      this.state.formType === "ProgramEnrolment";
    return (
      <div>
        {true && this.NewFormButton()}
        <Dialog
          fullWidth
          maxWidth="xs"
          onClose={this.handleClose}
          aria-labelledby="customized-dialog-title"
          open={this.state.open}
        >
          <DialogTitle id="customized-dialog-title" onClose={this.handleClose}>
            New Form
            <IconButton style={{ float: "right" }} onClick={this.handleClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <form>
            <DialogContent dividers>
              {this.state.errorMsg && (
                <FormControl fullWidth margin="dense">
                  <li style={{ color: "red" }}>{this.state.errorMsg}</li>
                </FormControl>
              )}
              <FormControl fullWidth margin="dense">
                <InputLabel htmlFor="formType">Form Type</InputLabel>
                <Select
                  id="formType"
                  name="formType"
                  value={this.state.formType}
                  onChange={this.onChangeField.bind(this)}
                  required
                >
                  <MenuItem value="IndividualProfile">IndividualProfile</MenuItem>
                  <MenuItem value="Encounter">Encounter</MenuItem>
                  <MenuItem value="ProgramEncounter">ProgramEncounter</MenuItem>
                  <MenuItem value="ProgramEnrolment">ProgramEnrollment</MenuItem>
                  <MenuItem value="ProgramExit">ProgramExit</MenuItem>
                  <MenuItem value="ProgramEnrolmentCancellation">
                    ProgramEnrollmentCancellation
                  </MenuItem>
                  <MenuItem value="ChecklistItem">ChecklistItem</MenuItem>
                </Select>
                {this.state.errors.formType && (
                  <FormHelperText error>{this.state.errors.formType}</FormHelperText>
                )}
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel htmlFor="name">Name</InputLabel>
                <Input
                  type="text"
                  id="formName"
                  name="name"
                  onChange={this.onChangeField.bind(this)}
                  fullWidth
                />
                {this.state.errors.name && (
                  <FormHelperText error>{this.state.errors.name}</FormHelperText>
                )}
              </FormControl>
              {this.subjectTypeElement()}
              {programBased && this.programNameElement()}
              {encounterTypes && this.encounterTypesElement()}
            </DialogContent>
            <DialogActions>
              <Button variant="contained" color="primary" onClick={this.addFields.bind(this)}>
                Add
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </div>
    );
  }
}

export default NewFormModal;
