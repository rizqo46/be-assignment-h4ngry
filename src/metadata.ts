/* eslint-disable */
export default async () => {
    const t = {
        ["./outlets/dto/outlets.dto"]: await import("./outlets/dto/outlets.dto"),
        ["./menus/dto/menus.dto"]: await import("./menus/dto/menus.dto"),
        ["./carts/dto/get.carts.dto"]: await import("./carts/dto/get.carts.dto"),
        ["./auth/dto/login.dto"]: await import("./auth/dto/login.dto"),
        ["./shared/dto/basic.dto"]: await import("./shared/dto/basic.dto")
    };
    return { "@nestjs/swagger": { "models": [[import("./shared/dto/pagination.dto"), { "PaginationReqDto": { cursor: { required: false, type: () => Number }, pageSize: { required: false, type: () => Number }, page: { required: false, type: () => Number }, search: { required: false, type: () => String, nullable: true } }, "PaginationRespDto": { nextCursor: { required: false, type: () => Number, nullable: true }, pageSize: { required: true, type: () => Number }, data: { required: true } }, "PaginationReqDtoV2": { pageSize: { required: false, type: () => Number }, page: { required: false, type: () => Number } }, "PaginationRespDtoV2": { page: { required: true, type: () => Number }, pageSize: { required: true, type: () => Number }, data: { required: true } } }], [import("./outlets/dto/outlets.dto"), { "OutletDto": { address: { required: true, type: () => String }, latitude: { required: true, type: () => Number }, longitude: { required: true, type: () => Number }, name: { required: true, type: () => String }, uuid: { required: true, type: () => String } }, "OutletRespDto": { data: { required: true, type: () => [t["./outlets/dto/outlets.dto"].OutletDto] } } }], [import("./menus/dto/menus.dto"), { "OutletMenuDto": { isAvailable: { required: true, type: () => Boolean }, description: { required: true, type: () => String }, image: { required: true, type: () => String }, name: { required: true, type: () => String }, uuid: { required: true, type: () => String }, price: { required: true, type: () => Number } }, "OutletMenuRespDto": { data: { required: true, type: () => [t["./menus/dto/menus.dto"].OutletMenuDto] } } }], [import("./auth/dto/login.dto"), { "LoginDto": { username: { required: true, type: () => String } }, "LoginRespDto": { accessToken: { required: true, type: () => String } } }], [import("./carts/dto/get.carts.dto"), { "CartItemRespDto": { uuid: { required: true, type: () => String }, quantity: { required: true, type: () => Number }, updatedAt: { required: true, type: () => Date }, isMenuAvailable: { required: true, type: () => Boolean }, menuName: { required: true, type: () => String }, menuImage: { required: true, type: () => String }, menuPrice: { required: true, type: () => Number } }, "CartsRespDto": { uuid: { required: true, type: () => String }, updatedAt: { required: true, type: () => Date }, outletName: { required: true, type: () => String }, outletUuid: { required: true, type: () => String }, items: { required: true, type: () => [t["./carts/dto/get.carts.dto"].CartItemRespDto] } }, "CartsPaginationRespDto": { data: { required: true, type: () => [t["./carts/dto/get.carts.dto"].CartsRespDto] } } }], [import("./carts/dto/carts.dto"), { "AddToCartDto": { outletUuid: { required: true, type: () => String }, menuUuid: { required: true, type: () => String }, quantity: { required: true, type: () => Number, minimum: 1 } }, "UpdateCartItemDto": { quantity: { required: true, type: () => Number, minimum: 1 } } }], [import("./shared/dto/basic.dto"), { "SuccessRespDto": { message: { required: true, type: () => String } } }], [import("./orders/dto/orders.dto"), { "OrderReqDto": { cartUuid: { required: true, type: () => String } } }]], "controllers": [[import("./outlets/outlets.controller"), { "OutletsController": { "findAll": { type: t["./outlets/dto/outlets.dto"].OutletRespDto } } }], [import("./menus/menus.controller"), { "MenusController": { "findMenusOnOutlet": { type: t["./menus/dto/menus.dto"].OutletMenuRespDto } } }], [import("./auth/auth.controller"), { "AuthController": { "login": { type: t["./auth/dto/login.dto"].LoginRespDto } } }], [import("./carts/carts.controller"), { "CartsController": { "addToCart": { type: t["./shared/dto/basic.dto"].SuccessRespDto }, "getAll": { type: t["./carts/dto/get.carts.dto"].CartsPaginationRespDto }, "updateCartItem": { type: t["./shared/dto/basic.dto"].SuccessRespDto }, "deleteCartItem": { type: t["./shared/dto/basic.dto"].SuccessRespDto }, "deleteCart": { type: t["./shared/dto/basic.dto"].SuccessRespDto } } }], [import("./orders/orders.controller"), { "OrdersController": { "createOrder": { type: t["./shared/dto/basic.dto"].SuccessRespDto } } }]] } };
};