# leyou-manage-web

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```



## 新增登录功能，用户名和密码都是admin

手动添加管理员账户

在`leyou-user`服务中：

```java
/**
 * 添加后台管理人员
 */
@Test
public void addAdmin(){
    User user = new User();
    user.setCreated(new Date());
    user.setPhone("88888888");
    user.setUsername("admin");
    user.setPassword("admin");
    String encodePassword = CodecUtils.passwordBcryptEncode(user.getUsername().trim(),user.getPassword().trim());
    user.setPassword(encodePassword);
    this.userMapper.insertSelective(user);
}
```

