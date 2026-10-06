const draft = {
  personal: null,
  contact: null,
  nicFormId: "",
  handledFresh: null,
};

export function readNicDraft() {
  return draft;
}

export function savePersonalDraft(personal) {
  draft.personal = personal;
}

export function saveContactDraft(contact) {
  draft.contact = contact;
}

export function saveNicFormId(id) {
  if (id) {
    draft.nicFormId = id;
  }
}

export function beginFreshDraft(token) {
  if (!token || draft.handledFresh === token) {
    return false;
  }
  draft.personal = null;
  draft.contact = null;
  draft.nicFormId = "";
  draft.handledFresh = token;
  return true;
}

export function clearNicDraft() {
  draft.personal = null;
  draft.contact = null;
  draft.nicFormId = "";
  draft.handledFresh = null;
}
