import React, { Component } from "react";
import { StyleWrapper } from "style";

import apiService, { ybitApiService } from "utils/api";

import Main from "./Main";

import Loading from "./Loading";

class App extends Component {
  state = {
    loading: false,
    initialContent: false,
    canEdit: true,
    initialStringContent: ""
  };

  componentDidMount() {
    this.getContent();
  }

  getContent = () => {
    // apiService.get('/notes/').then(async res => {
    //   let rawState = res.data.body && res.data.body !== ' ' ? JSON.parse(res.data.body) : null;
    //   if (rawState) rawState = await this.updateImageUrls(rawState, res.data.integration_id);
    //   this.setState({
    //     initialStringContent: res.data.body,
    //     initialContent: rawState,
    //     loading: false,
    //     canEdit: res.data.canEdit,
    //     integrationId: res.data.integration_id
    //   });
    // });
  };

  uploadImage = data =>
    ybitApiService
      .post(`integration/${this.state.integrationId}/files`, data)
      .then(res => ({ id: res.data.id, url: res.data.url }));

  getImageUrl = (id, integrationId) =>
    ybitApiService
      .get(`integration/${integrationId}/files/${id}`)
      .then(res => res.data.url);

  updateImageUrls = async (state, integrationId) => {
    for (const index in state.entityMap) {
      try {
        const entity = state.entityMap[index];
        state.entityMap[index] =
          entity.type === "image"
            ? {
                ...entity,
                data: {
                  ...entity.data,
                  src: await this.getImageUrl(entity.data.id, integrationId)
                }
              }
            : entity;
      } catch (error) {
        console.error(error);
      }
    }
    return state;
  };

  setLoading = bool => {
    this.setState({ loading: bool });
  };

  render() {
    return (
      <StyleWrapper>
        {this.state.loading ? (
          <Loading />
        ) : (
          <Main
            initialStringContent={null}
            initialContent={null}
            getImageUrl={this.getImageUrl}
            setLoading={this.setLoading}
            updateImageUrls={this.updateImageUrls}
            getContent={this.getContent}
            canEdit={this.state.canEdit}
            uploadImage={this.uploadImage}
          />
        )}
      </StyleWrapper>
    );
  }
}
export default App;
