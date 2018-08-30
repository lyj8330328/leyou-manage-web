<template>
  <v-stepper :value="step">
    <v-stepper-header>
      <v-stepper-step step="1" :complete="step > 1">基本信息</v-stepper-step>
      <v-divider/>
      <v-stepper-step step="2" :complete="step > 2">商品描述</v-stepper-step>
      <v-divider/>
      <v-stepper-step step="3" :complete="step > 3">规格参数</v-stepper-step>
      <v-divider/>
      <v-stepper-step step="4">SKU属性</v-stepper-step>
    </v-stepper-header>
    <v-stepper-items>
      <!--基本信息的表单-->
      <v-stepper-content step="1">
        <v-layout justify-center>
          <v-flex xs10>
            <v-form v-model="valid" ref="basic">
              <v-layout row>
                <v-flex xs5>
                  <v-cascader url="/item/category/list" v-model="goods.categories"
                              required show-all-levels label="商品分类"/>
                </v-flex>
                <v-flex offset-xs2 xs5>
                  <v-select label="所属品牌" v-model="goods.brandId" :items="brandOptions" dense autocomplete
                            item-text="name" item-value="id" :rules="[v => !!v || '品牌不能为空']" required/>
                </v-flex>
              </v-layout>

              <v-text-field label="商品标题" v-model="goods.title" :counter="200" required
                            :rules="[v => !!v || '商品标题不能为空']"/>
              <v-text-field label="商品卖点" v-model="goods.subTitle" :counter="200"/>
              <v-text-field label="包装清单" v-model="goods.spuDetail.packingList" :counter="1000" multi-line :rows="3"/>
              <v-text-field label="售后服务" v-model="goods.spuDetail.afterService" :counter="1000" multi-line :rows="3"/>
              <v-layout row>
                <v-flex xs3>
                </v-flex>
                <v-flex>
                </v-flex>
              </v-layout>
            </v-form>
          </v-flex>
        </v-layout>
      </v-stepper-content>
      <!--商品描述-->
      <v-stepper-content step="2">
        <quill-editor v-model="goods.spuDetail.description" :options="editorOption"/>
      </v-stepper-content>
      <!--规格参数-->
      <v-stepper-content step="3">
        <v-flex offset-xs1 xs10>
          <v-card v-for="(spec, i1) in specifications" :key="i1" class="my-2" v-if="!spec.empty">
            <v-card-title><h4>{{spec.group}}</h4></v-card-title>
            <v-divider/>
            <v-layout column justify-center>
              <v-flex v-for="(param,i2) in spec.params" :key="i2" xs8>
                <v-layout v-if="param.global" row>
                  <v-flex offset-xs2 xs8>
                    <v-text-field v-if="param.options.length <= 0" :suffix="param.unit || ''"
                                  v-model="param.v" :label="param.k"/>
                    <v-select v-else :label="param.k" v-model="param.v" :items="param.options"/>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-layout>
          </v-card>
        </v-flex>
      </v-stepper-content>
      <!--SKU属性-->
      <v-stepper-content step="4">
        <v-layout column>
          <h3>sku属性：</h3>
          <v-divider/>
          <v-flex offset-xs1>
            <div v-for="(t,i) in template" :key="i">
              <h4>{{t.k}}:</h4>
              <div class="px-5" v-if="t.options.length <= 0">
                <!--默认项-->
                <v-layout row>
                  <v-flex xs8>
                    <v-text-field :label="`请输入新的${t.k}`" v-model="skuTemplate[i].options[0]"/>
                  </v-flex>
                  <v-spacer/>
                  <v-flex xs1>
                    <v-btn icon small @click="deleteOption(i,0)"><i class="el-icon-delete"></i></v-btn>
                  </v-flex>
                </v-layout>
                <!--其他项-->
                <v-layout row v-for="i2 in skuTemplate[i].options.length" :key="i2">
                  <v-flex xs8>
                    <v-text-field :label="`请输入新的${t.k}`" v-model="skuTemplate[i].options[i2]"/>
                  </v-flex>
                  <v-spacer/>
                  <v-flex xs1>
                    <v-btn icon small @click="deleteOption(i,i2)"><i class="el-icon-delete"></i></v-btn>
                  </v-flex>
                </v-layout>
              </div>
              <div class="px-5" v-else>
                <v-container fluid grid-list-xs>
                  <v-layout row wrap>
                    <v-flex v-for="o in t.options" :key="o" xs3>
                      <v-checkbox color="primary" :label="o" v-model="skuTemplate[i].options"
                                  :value="o"/>
                    </v-flex>
                  </v-layout>
                </v-container>
              </div>
            </div>
          </v-flex>
          <v-divider/>
          <!--sku列表-->
          <h3>sku列表：</h3>
          <v-flex>
            <v-data-table
              :headers="headers"
              :items="skus"
              hide-actions
              class="elevation-2"
              item-key="indexes"
            >
              <!-- 表单每行样式 -->
              <template slot="items" slot-scope="props">
                <tr @click="props.expanded = !props.expanded">
                  <td class="text-xs-center" v-for="[k,v] in Object.entries(props.item)" :key="k"
                      v-if="!['id','price','stock','enable','indexes','images'].includes(k)"
                  >{{v}}
                  </td>
                  <td  class="text-xs-center">
                    <v-text-field single-line label="0" v-model="props.item.price"
                                  :rules="[val => /^([1-9]\d*)\.?(\d{0,2})$/.test(val) || '价格格式错误']"/>
                  </td>
                  <td class="text-xs-center">
                    <v-text-field single-line label="0" v-model="props.item.stock"
                                  :rules="[val => /^[1-9]\d*$/.test(val) || '库存必须是整数']"/>
                  </td>
                  <td  class="text-xs-center">
                    <v-checkbox v-model="props.item.enable"/>
                  </td>
                </tr>
              </template>
              <!--表单扩展项，当用户点击启用时才展开-->
              <template v-if="props.item.enable" slot="expand" slot-scope="props" class="px-4">
                <v-card flat class="pb-3">
                  <v-card-title>为商品上传图片：</v-card-title>
                  <v-card-text>
                    <v-upload multiple url="/item/upload" v-model="props.item.images"/>
                  </v-card-text>
                </v-card>
              </template>
              <template slot="no-data">
                <v-alert :value="true" color="warning" icon="warning">
                  请至少选择一个商品属性
                </v-alert>
              </template>
            </v-data-table>
          </v-flex>
        </v-layout>
        <v-layout row>
          <v-flex offset-xs5 xs2>
            <v-btn color="primary" @click="submit">保存商品</v-btn>
          </v-flex>
        </v-layout>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>

<script>
  import 'quill/dist/quill.core.css'
  import 'quill/dist/quill.snow.css'
  import 'quill/dist/quill.bubble.css'

  import {quillEditor} from 'vue-quill-editor'

  export default {
    name: "goods-form",
    components: {
      quillEditor
    },
    props: {
      step: {
        type: Number,
        default: 1,
      },
      isEdit: {
        type: Boolean,
        default: false
      },
      oldGoods: Object
    },
    data() {
      return {
        valid: false,
        editorOption: {// 富文本编辑器配置
          placeholder: '编写商品描述信息，让客户了解你的商品'
        },
        brandOptions: [],// 品牌的待选项
        specifications: [],// 规格参数模板
        template: [],// 特有规格属性模板
        skuTemplate: [],// sku特有属性模板
        skus: [],
        headers: [],// 表头
        goods: {
          categories: null,// 选中的商品分类id数组
          brandId: null,
          title: '',
          subTitle: '',
          spuDetail: {
            packingList: '',
            afterService: '',
            description: '',
            specTemplate: '',// sku属性模板的字符串格式
            specifications:[]
          },
        },
      }
    },
    methods: {
      deleteOption(i, j) {
        this.skuTemplate[i].options.splice(j, 1);
      },
      loadSku(src, dest, i, o) {
        const t = src[i];
        for (let x = 0; x < t.options.length; x++) {
          const obj = {};
          obj[t.k] = t.options[x];
          Object.assign(obj, o);
          if (i === src.length - 1) {
            obj.indexes += x;
            dest.push(obj);
          } else {
            obj.indexes += x + '_';
            this.loadSku(src, dest, i + 1, obj);
          }
        }
      },
      submit() {
        // goods中的商品分类id
        if (!this.goods.categories || this.goods.categories.length < 3) {
          this.$message.error("商品分类填写不正确！")
          return;
        }
        // sku信息
        if (!this.skus || this.skus.length <= 0) {
          this.$message.error("请填写sku信息！")
          return;
        }
        this.goods['cid1'] = this.goods.categories[0].id;
        this.goods['cid2'] = this.goods.categories[1].id;
        this.goods['cid3'] = this.goods.categories[2].id;
        // 转为字符串保存
        const obj = {};
        this.skuTemplate.forEach(t => {
          if(t.options.length > 0){
            obj[t.k] = t.options;
          }
        })
        this.goods.spuDetail.specTemplate = JSON.stringify(obj);

        // 对全局规格参数进行深拷贝
        const specs = [];
        Object.deepCopy(this.specifications, specs);
        specs.forEach(({params}) => {
          params.forEach(p => {
            if (!p.global) {
              p.options = this.skuTemplate[p.k];
            }
          })
        })
        // 处理全局规格参数
        this.goods.spuDetail.specifications = JSON.stringify(specs);

        // 封装sku信息
        this.goods['skus'] = this.skus.filter(s => s.enable).map(s => {
          const {price, stock, enable, indexes, images, ...skuSpecs} = s;
          // 拼接title数据（spu的title加上特有的规格参数）
          let title = this.goods.title;
          Object.values(skuSpecs).forEach(v => title += " " + v);
          return {
            id: s.id || null,
            enable,
            title,
            images: images && images.length > 0 ? images.join(",") : "",
            price : this.$format(price),
            ownSpec: JSON.stringify(skuSpecs),
            indexes,
            stock: {stock}
          }
        })
        // 发起请求
        this.$http({
          url: "/item/goods",
          method: this.isEdit ? "put" : "post",
          data: this.goods
        })
          .then(() => {
            this.$message.success("提交商品成功！");
            this.$emit("closeForm")
          })
          .catch((e) => {
            console.log(e)
            this.$message.error("提交商品失败！");
            this.$emit("closeForm")
          })
      }
    },
    watch: {
      oldGoods: {
        deep: true,
        handler(val) {
          if (val == null || !this.isEdit) {
            return;
          }
          // 实现数据回显
          Object.deepCopy(val, this.goods)
        }
      },
      'goods.categories': {
        deep: true,
        handler(val) {
          // 根据分类加载品牌信息
          this.$http.get("/item/brand/cid/" + val[2].id)
            .then(resp => {
              this.brandOptions = resp.data;
            })
          // 根据分类加载规格参数
          this.$http.get("/item/spec/" + val[2].id)
            .then(resp => {
              this.specifications = resp.data;
              this.template = [];
              this.skuTemplate = [];
              // 过滤出SKU属性
              for (let i = 0; i < this.specifications.length; i++) {
                const params = this.specifications[i].params;
                let x = params.length;
                for (let j = 0; j < params.length; j++) {
                  const p = params[j];
                  if (!p.global) {
                    this.template.push({
                      k:p.k,
                      options:p.options
                    })
                    this.skuTemplate.push({
                      k:p.k,
                      options:[]
                    });
                    x--;
                  }
                  if (this.isEdit) {
                    p.v = this.goods.spuDetail.specifications[i].params[j].v;
                  }
                }
                if (x === 0) {
                  // 标记当前分组下的全局属性为空
                  this.specifications[i]['empty'] = true;
                }
              }
              // 判断是否修改，需要回显数据
              if (this.isEdit) {
                this.skuTemplate.forEach(t => {
                  t.options = this.goods.spuDetail.specTemplate[t.k]
                });
              }
            })
        }
      },
      skuTemplate: {
        deep: true,
        handler(val) {
          const src = val.filter(v => v.options.length > 0);
          if (src.length <= 0) {
            return;
          }
          this.headers = [];
          this.skus = [];
          this.loadSku(src, this.skus, 0, {
            price: null,
            stock: null,
            indexes: '',
            enable: false
          });
          // 处理回显
          if (this.isEdit) {
            // 查询sku
            this.$http.get("/item/goods/sku/list", {
              params: {
                id: this.goods.id
              }
            }).then(resp => {
              // 处理SKU
              this.skus.forEach(sku => {
                resp.data.forEach(s => {
                  if (sku.indexes === s.indexes) {
                    sku.id = s.id;
                    sku.price = this.$format(s.price);
                    sku.stock = s.stock.stock;
                    sku.images = s.images.split(",");
                    sku.enable = s.enable;
                  }
                })
              })
            })
          }
          // 生成表内容
          this.headers = [
            {text: 'price', align: 'center', sortable: false, value: 'name'},
          ]
          // 生成表头
          this.headers = [];
          if (this.skus.length > 0) {
            Object.keys(this.skus[0]).forEach(text => {
              let width = "80";
              if (text == "indexes") {
                return
              }
              if (text == "price") {
                text = "价格";
                width = "50";
              } else if (text == "stock") {
                text = "库存";
                width = "50";
              } else if (text == "enable") {
                text = "是否启用";
                width = "30";
              }
              this.headers.push({
                text,
                align: 'center',
                sortable: false,
                value: text,
                width
              })
            })
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>
