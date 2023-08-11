import { app, h } from "hyperapp";
import "./products.css";

const Fragment = (props, children) => children;

function onChangeIsUpdate() {
  document.querySelector(".divUpdate").classList.remove('d-none');
}

const Product = ({
  product,
  newProduct,
  input,
  inputProductDetail,
  create,
  update,
  isAdmin,
  fn,
  fnSetProposedPrice,
  fnSetTimeout,
}) => {
  let data = {};
  let price;
  let timeout;
  return (
    <>
      {product ? (
        <div class="card product">
          <div class="card-header">
            <strong>{product.name}</strong>
          </div>
          <div class="card-body">
            <img
              class="rounded float-left product-image"
              src={
                product.image.startsWith("http")
                  ? product.image
                  : "//robohash.org/" + product.image + "?set=set4&bgset=bg2"
              }
            ></img>

            <dl class="row">
              <dt class="col-sm-4">Name</dt>
              <dd class="col-sm-8">
                <h5>{product.name}</h5>
              </dd>

              <dt class="col-sm-4">Description</dt>
              <dd class="col-sm-8">
                <p>{product.description}</p>
              </dd>

              {isAdmin ? (
                <>
                  <dt class="col-sm-4">Proposed Price</dt>
                  <dd class="col-sm-8">
                    <p>$ {product.price}</p>
                  </dd>
                </>
              ) : (
                <></>
              )}

              <dt class="col-sm-4">Final Price</dt>
              <dd class="col-sm-8">
                <p>{product.finalPrice}</p>
              </dd>

              <dt class="col-sm-4">Status</dt>
              <dd class="col-sm-8">
                <p>{product.status}</p>
              </dd>
              {isAdmin ? (
                <dd class="col-12">
                  <button class="btn btn-outline-primary" type="button"
                    onclick={(e) => {
                      onChangeIsUpdate();
                    }}
                  >Update</button>
                </dd>
              ) : (
                <></>
              )}
            </dl>
          </div>
          {product.status !== "Close" ? (
            isAdmin ? (
              <>
                <div class="card-footer">
                  <div class="input-group mb-3">
                    <input
                      type="number"
                      class="form-control"
                      placeholder="Timeout"
                      oninput={(e) => {
                        timeout = e.target.value;
                      }}
                    />
                    <div class="input-group-append">
                      <button
                        class="btn btn-outline-primary"
                        type="button"
                        onclick={(e) => {
                          fnSetTimeout(timeout);
                        }}
                      >
                        Set Timeout
                      </button>
                    </div>
                  </div>
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <button
                        class="btn btn-outline-primary"
                        type="button"
                        onclick={(e) => {
                          data.action = "start";
                          fn(data);
                        }}
                      >
                        Start
                      </button>
                      <button
                        class="btn btn-outline-primary"
                        type="button"
                        onclick={(e) => {
                          data.action = "stop";
                          fn(data);
                        }}
                      >
                        Stop
                      </button>
                    </div>
                    <input
                      type="number"
                      class="form-control"
                      placeholder="price"
                      oninput={(e) => {
                        price = e.target.value;
                      }}
                    />
                    <div class="input-group-append">
                      <button
                        class="btn btn-outline-primary"
                        type="button"
                        onclick={(e) => {
                          data.action = "pricing";
                          data.price = price;
                          fn(data);
                        }}
                      >
                        Set price and close
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div class="card-footer">
                <div class="input-group">
                  <input
                    type="number"
                    class="form-control"
                    placeholder="price"
                    oninput={(e) => (price = e.target.value)}
                  />
                  <div class="input-group-append">
                    <button
                      class="btn btn-primary"
                      type="button"
                      onclick={(e) => fnSetProposedPrice(price)}
                    >
                      Propose price
                    </button>
                  </div>
                </div>
              </div>
            )
          ) : (
            <></>
          )}
        </div>
      ) : (
        <></>
      )}
      {isAdmin ? (
        <>
          {product ? (
            <>
              <div class="card divUpdate d-none">
                <div class="card-header">
                  <strong>Update session</strong>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-sm-12">
                      <div class="form-group">
                        <label for="name">Product name</label>
                        <input
                          type="text"
                          class="form-control"
                          id="name"
                          value={product.name}
                          oninput={(e) => {
                            inputProductDetail({
                              field: "name",
                              value: e.target.value,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-sm-12">
                      <div class="form-group">
                        <label for="description">Product description</label>
                        <input
                          type="text"
                          class="form-control"
                          id="description"
                          value={product.description}
                          oninput={(e) => {
                            inputProductDetail({
                              field: "description",
                              value: e.target.value,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-sm-12">
                      <div class="form-group">
                        <label for="image">Product image</label>
                        <input
                          type="text"
                          class="form-control"
                          id="image"
                          placeholder="http://"
                          value={product.image}
                          oninput={(e) => {
                            inputProductDetail({
                              field: "image",
                              value: e.target.value,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-footer">
                  <button
                    type="submit"
                    class="btn btn-primary"
                    onclick={update}
                  >
                    Update
                  </button>
                </div>
              </div>
            </>
          ) : (
            <></>
          )}
          <div class="card">
            <div class="card-header">
              <strong>Create new session</strong>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-sm-12">
                  <div class="form-group">
                    <label for="name">Product name</label>
                    <input
                      type="text"
                      class="form-control"
                      id="name"
                      value={newProduct.name}
                      oninput={(e) => {
                        input({ field: "name", value: e.target.value });
                      }}
                    />
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-sm-12">
                  <div class="form-group">
                    <label for="description">Product description</label>
                    <input
                      type="text"
                      class="form-control"
                      id="description"
                      value={newProduct.description}
                      oninput={(e) => {
                        input({ field: "description", value: e.target.value });
                      }}
                    />
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-sm-12">
                  <div class="form-group">
                    <label for="image">Product image</label>
                    <input
                      type="text"
                      class="form-control"
                      id="image"
                      placeholder="http://"
                      value={newProduct.image}
                      oninput={(e) => {
                        input({ field: "image", value: e.target.value });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <button type="submit" class="btn btn-primary" onclick={create}>
                Create
              </button>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

const ProductRow = ({ product, index, select, currentIndex, isAdmin }) => (
  <tr
    onclick={(e) => {
      select(index);
      participantWinner = undefined;
      document.querySelector(".divUpdate").classList.add('d-none');
    }}
    class={index === currentIndex ? "active" : ""}
  >
    <th scope="row">{product.no}</th>
    <td>{product.name}</td>
    <td>{product.description} </td>
    {isAdmin ? <td>$ {product.price}</td> : <></>}
    <td>{product.status}</td>
  </tr>
);

const ParticipantRow = ({ participant, index }) => (
  <tr>
    <th scope="row">{index} </th>
    <td>{participant.fullname}</td>
    <td>$ {participant.price}</td>
    <td>{participant.deviation} %</td>
  </tr>
);
let participantWinner;

const Products = ({ match }) =>
  (
    { newProduct, sessions, currentProductIndex, isAdmin },
    {
      inputNewProduct,
      inputProductDetail,
      createProduct,
      updateProduct,
      selectProduct,
      sessionFn,
      setProposedPrice,
      setTimeout,
    }
  ) => {
    return (
      <div class="d-flex flex-wrap w-100">
        <div class={!isAdmin && sessions.length == 0 ? "col-12" : "col-md-6 mb-5"}>
        <div class="row">
          <div class="bg-white border-right products-list mb-5 col-12">
            <table class="table table-hover table-striped">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Product</th>
                  <th scope="col">Description</th>
                  {isAdmin ? <th scope="col">Proposed price</th> : <></>}
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length > 0 ? (
                  sessions.map((p, i) => {
                    p.no = i + 1;
                    return (
                      <ProductRow
                        product={p}
                        index={i}
                        select={selectProduct}
                        currentIndex={currentProductIndex}
                        isAdmin={isAdmin}
                      ></ProductRow>
                    );
                  })
                ) : (
                  <tr>
                    <td colspan="5" class="text-center">
                      No data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {isAdmin ? (
            <div class="bg-white border-right products-list mb-5 col-12">
              <h2 class="text-center">List participants</h2>
              <table class="table table-hover table-striped">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">FullName</th>
                    <th scope="col">Price</th>
                    <th scope="col">Deviation</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions[currentProductIndex] != undefined &&
                    sessions[currentProductIndex].participantsOfSession !=
                    undefined &&
                    sessions[currentProductIndex].participantsOfSession.length >
                    0 ? (
                    sessions[currentProductIndex].participantsOfSession.map(
                      (p, i) => {
                        if (sessions[currentProductIndex].status === "Close" &&
                          sessions[currentProductIndex].participantWinner
                            .account == p.account) {
                          participantWinner = p;
                        }
                        return (
                          <ParticipantRow
                            participant={p}
                            index={i + 1}
                          ></ParticipantRow>
                        );
                      }
                    )
                  ) : (
                    <tr>
                      <td colspan="4" class="text-center">
                        No data
                      </td>
                    </tr>
                  )}
                  {participantWinner != undefined ? (
                    <tr>
                      <td colspan="4">
                        Participant winner is {participantWinner.fullname}
                      </td>
                    </tr>
                  ) : (
                    <></>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div class="col-md-6 mb-5 flex product-detail">
          <Product
            newProduct={newProduct}
            input={inputNewProduct}
            create={createProduct}
            inputProductDetail={inputProductDetail}
            update={updateProduct}
            product={sessions[currentProductIndex]}
            isAdmin={isAdmin}
            fn={sessionFn}
            fnSetProposedPrice={setProposedPrice}
            fnSetTimeout={setTimeout}
          ></Product>
        </div>
      </div>
    );
  };

export { Products };
