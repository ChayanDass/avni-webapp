import { map, get, chain, mapValues, find, isEmpty } from "lodash";
import { labelValue } from "../util/util";

export const initialState = {
  metadata: {},
  loaded: false,
  filterCriteria: {
    subjectType: null,
    name: null,
    addressIds: [],
    syncAttribute1: null,
    syncAttribute2: null,
    program: null,
    userGroup: null,
    assignedTo: { label: "Unassigned", value: "0" },
    createdOn: null
  }
};

const clone = state => {
  const newState = {};
  newState.metadata = { ...state.metadata };
  newState.loaded = state.loaded;
  newState.filterCriteria = { ...state.filterCriteria };
  return newState;
};

export const SubjectAssignmentReducer = (state, action) => {
  const newState = clone(state);
  const payload = action.payload;
  switch (action.type) {
    case "setMetadata": {
      newState.metadata = payload;
      const { subjectTypes } = payload;
      const subjectType = chain(subjectTypes)
        .first()
        .value();
      newState.filterCriteria.subjectType = {
        label: get(subjectType, "name", null),
        value: get(subjectType, "uuid", "")
      };
      newState.loaded = true;
      return newState;
    }
    case "setFilter": {
      const { filter, value } = payload;
      newState.filterCriteria[filter] = value;
      return newState;
    }
    default:
      return newState;
  }
};

export const getSyncAttributes = (metaData, filterCriteria) => {
  const selectedSubjectType = find(
    metaData.subjectTypes,
    ({ uuid }) => uuid === filterCriteria.subjectType.value
  );
  const syncAttribute1 = find(
    metaData.syncAttributes,
    ({ uuid }) => uuid === get(selectedSubjectType, "syncRegistrationConcept1")
  );
  const syncAttribute2 = find(
    metaData.syncAttributes,
    ({ uuid }) => uuid === get(selectedSubjectType, "syncRegistrationConcept2")
  );
  return { syncAttribute1, syncAttribute2 };
};
export const getMetadataOptions = (metadata, filterCriteria) => {
  const { subjectTypes, programs, users, groups } = metadata;
  const subjectOptions = map(subjectTypes, ({ uuid, name }) => labelValue(name, uuid));
  const { syncAttribute1, syncAttribute2 } = getSyncAttributes(metadata, filterCriteria);
  const programOptions = map(programs, ({ uuid, name }) => labelValue(name, uuid));
  const userOptions = map(users, ({ uuid, name }) => labelValue(name, uuid));
  const userGroupOptions = map(groups, ({ uuid, name }) => labelValue(name, uuid));
  return {
    subjectOptions,
    programOptions,
    userOptions,
    userGroupOptions,
    syncAttribute1,
    syncAttribute2
  };
};

export const getFilterPayload = filterCriteria => {
  const filterCriteriaValues = mapValues(filterCriteria, value => get(value, "value", value));
  const concept = [];
  if (!isEmpty(filterCriteria.syncAttribute1)) {
    concept.push(filterCriteria.syncAttribute1);
  }
  if (!isEmpty(filterCriteria.syncAttribute2)) {
    concept.push(filterCriteria.syncAttribute2);
  }
  filterCriteriaValues.concept = concept;
  return filterCriteriaValues;
};

export const getConceptSearchContract = (concept, selectedValue) => {
  const dataType = concept.dataType;
  const isNumeric = dataType === "Numeric";
  return {
    uuid: concept.uuid,
    searchScope: "REGISTRATION",
    dataType: dataType,
    values: [],
    minValue: isNumeric ? selectedValue : null,
    value: selectedValue
  };
};
