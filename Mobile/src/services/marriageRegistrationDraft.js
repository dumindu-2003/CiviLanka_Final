const EMPTY_MARRIAGE_FORM = {
  applicantIsGroom: true,
  applicantName: "",
  applicantNic: "",
  applicantMobile: "",
  applicantAddress: "",
  applicantDob: "",
  groomName: "",
  groomNic: "",
  groomDob: "",
  groomAge: "",
  groomOccupation: "",
  groomAddress: "",
  groomReligion: "",
  groomNationality: "",
  groomMaritalStatus: "",
  groomStatus: "",
  brideName: "",
  brideNic: "",
  brideDob: "",
  brideAge: "",
  brideMobile: "",
  brideOccupation: "",
  brideAddress: "",
  brideReligion: "",
  brideNationality: "",
  brideMaritalStatus: "",
  brideStatus: "",
  marriageDate: "",
  marriagePlace: "",
  registrarName: "",
  registrationNumber: "",
  femaleWitnessName: "",
  femaleWitnessNic: "",
  femaleWitnessRelationship: "",
  femaleWitnessAddress: "",
  femaleWitnessPhone: "",
  maleWitnessName: "",
  maleWitnessNic: "",
  maleWitnessRelationship: "",
  maleWitnessAddress: "",
  maleWitnessPhone: "",
  declarationAccepted: false,
  officerName: "",
  officerServiceNumber: "",
  officerPin: "",
};

let draft = { ...EMPTY_MARRIAGE_FORM };
let handledFresh = null;

export function emptyMarriageForm() {
  return { ...EMPTY_MARRIAGE_FORM };
}

export function beginFreshMarriageDraft(fresh) {
  if (!fresh || fresh === handledFresh) {
    return;
  }
  draft = { ...EMPTY_MARRIAGE_FORM };
  handledFresh = fresh;
}

export function readMarriageDraft() {
  return { ...draft };
}

export function saveMarriageDraft(next) {
  draft = { ...next };
}

export function clearMarriageDraft() {
  draft = { ...EMPTY_MARRIAGE_FORM };
  handledFresh = null;
}
