<template>
  <v-stepper v-model="step">
    <v-stepper-header class="mt-2">
      <v-stepper-step :complete="step > 1" step="1">基本信息</v-stepper-step>

      <v-divider></v-divider>

      <v-stepper-step :complete="step > 2" step="2">商品描述</v-stepper-step>

      <v-divider></v-divider>

      <v-stepper-step :complete="step > 3" step="3">规格参数</v-stepper-step>

      <v-divider></v-divider>

      <v-stepper-step step="4">SKU属性</v-stepper-step>
    </v-stepper-header>

    <v-stepper-items>
      <v-stepper-content step="1" style="height: 480px">
        <v-form v-model="valid"  ref="basic">
          <v-layout class="justify-center">
            <v-flex xs12>
                <v-layout row>
                  <v-flex xs5>
                    <v-cascader
                      url="/item/category/list"
                      showAllLevels
                      required
                      v-model="goods.categories"
                      label="请选择商品分类"/>
                  </v-flex>
                  <v-spacer></v-spacer>
                  <v-flex xs5>
                    <!--品牌-->
                    <v-select
                      :items="brandOptions"
                      item-text="name"
                      item-value="id"
                      label="所属品牌"
                      required
                      v-model="goods.brandId"
                      autocomplete
                      clearable
                      dense chips
                      :rules="[v => !!v || '品牌不能为空']"
                    />
                  </v-flex>
                </v-layout>
            </v-flex>
          </v-layout>
          <v-text-field label="商品标题" v-model="goods.title" :counter="200" :rules="[v => !!v || '品牌名称不能为空']" required />
          <v-text-field label="商品卖点" v-model="goods.subTitle" :counter="200"/>
          <v-text-field label="包装清单" v-model="goods.spuDetail.packingList" :counter="500" multi-line :rows="3"/>
          <v-text-field label="售后服务" v-model="goods.spuDetail.afterService" :counter="500" multi-line :rows="3"/>
        </v-form>
      </v-stepper-content>

      <v-stepper-content step="2" >
        <!--<quill-editor style="height: 430px" v-model="goods.spuDetail.description" :options="editorOption"/>-->
        <v-editor  v-model="goods.spuDetail.description" upload-url="/upload/image" fileName="file"/>
        <v-divider></v-divider>
      </v-stepper-content>

      <v-stepper-content step="3">
        <v-flex class="xs10 mx-auto px-3">
            <v-card v-for="spec in specifications" :key="spec.group" class="my-2">
              <v-card-title class="subheading"><h4>{{spec.group}}</h4></v-card-title>
                <v-divider></v-divider>
                <v-card-text v-for="param in spec.params" :key="param.key" v-if="param.global" class="px-5">
                  <!--判断是否有可选项，如果没有，则显示文本框。还要判断是否是数值类型，如果是则把unit显示到后缀-->
                  <v-text-field v-if="param.options.length <= 0" :label="param.k" v-model="param.v" :suffix="param.unit || ''"></v-text-field>
                  <!--否则，显示下拉选项-->
                  <v-select v-else :label="param.k" v-model="param.v" :items="param.options"/>
                </v-card-text>
            </v-card>
        </v-flex>
      </v-stepper-content>
      <v-stepper-content step="4">
        <v-card v-for="spec in specialSpecs" :key="spec.k">
          <v-card-title v-if="spec.options.length <= 0" class="subheading">
            <h4 class="xs3">{{spec.k}}</h4>
            <v-spacer></v-spacer>
            <!--
                如何控制文本框的增加与删除
                1.借助selected属性，因为它是一个数组，所以可以把文本框的个数与数组的长度绑定
                2.获取selected的长度，点击增加，则把selected.length++复制给count
                3.然后用v-for遍历count,显示出对应个数的文本框，然后文本框绑定对应的selected数组下标,因为v-for遍历是从1开始的，
                  所以count+1，然后文本框与数组下标绑定的时候下标为i-1
                4.删除，是把文本框对应的数组下标中所包含的内容从数组中移除，使用splice函数，从i-1开始
            -->
            <v-btn flat icon color="primary" @click="count=spec.selected.length++">
              <v-icon>add</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-title v-else class="subheading">
            <h4>{{spec.k}}</h4>
          </v-card-title>
          <v-card-text v-if="spec.options.length <= 0" class="px-5">
            <!--当可选属性options的长度为0时，进行渲染，说明此时是对特有属性的渲染-->
            <div v-for="i in count+1" :key="i">
              <v-layout row>
                <v-text-field :label="'输入新的'+spec.k" v-model="spec.selected[i-1]"></v-text-field>
                <!--当数组的长度为0时，说明是第一次渲染，所以此时禁用删除按钮；当长度为1时，说明不是第一次渲染，可能是增加完进行删除后的结果，所以此时也要禁用删除按钮-->
                <v-btn :disabled="spec.selected.length === 1 || spec.selected.length === 0" flat icon color="error" @click="spec.selected.splice(i-1,1),count=spec.selected.length-1">
                  <v-icon>delete</v-icon>
                </v-btn>
              </v-layout>
            </div>
          </v-card-text>
          <v-card-text v-else class="container fluid grid-list-xs">
              <v-layout row wrap class="px-5">
                <v-checkbox color="primary" v-for="p in spec.options" :key="p" class="flex xs3" :label="p" v-model="spec.selected" :value="p">
                </v-checkbox>
              </v-layout>
          </v-card-text>
        </v-card>
        <v-divider></v-divider>
        <v-card>
          <v-card-title class="subheading"><h4>SKU列表</h4></v-card-title>
          <v-card-text v-if="skusLength > 0">
            <v-data-table :items="skus" :headers="headers" hide-actions item-key="indexes" class="elevation-4">
              <!--数据列表-->
              <template slot="items" slot-scope="props">
                <tr @click="props.expanded = !props.expanded">
                  <td class="text-xs-center" v-for="(v,k) in props.item" :key="k"
                      v-if="!['id','price','stock','enable','indexes','images'].includes(k)"
                  >{{v}}
                  </td>
                  <td   class="text-xs-center">
                    <v-text-field single-line label="d" v-model="props.item.price"
                                  :rules="[val => /^([1-9]\d*)\.?(\d{0,2})$/.test(val) || '价格格式错误']"/>
                  </td>
                  <td  class="text-xs-center">
                    <v-text-field single-line label="0" v-model="props.item.stock"
                                  :rules="[val => /^[1-9]\d*$/.test(val) || '库存必须是整数']"/>
                  </td>
                  <!--
                    坑：如果不添加判断为什么点击checkbox没有反应？  计算属性
                  -->
                  <td   class="text-xs-center">
                    <v-checkbox color="primary" v-model="props.item.enable"/>
                  </td>
                </tr>
              </template>
              <!--点击表格后展开-->
              <template v-if="props.item.enable" class="px-4" slot="expand" slot-scope="props">
                <v-card flat>
                  <v-card-title><h4>上传图片</h4></v-card-title>
                  <v-card-text>
                    <v-upload ref="image_url"
                              v-model="props.item.images"
                              url="/upload/image"
                              :multiple="true"
                              :pic-width="250"
                              :pic-height="250"
                    />
                  </v-card-text>
                </v-card>
              </template>
            </v-data-table>
          </v-card-text>
          <v-card-text v-else>
            <v-alert :value="true" color="warning" icon="warning">
              请选择商品属性
            </v-alert>
          </v-card-text>
        </v-card>
        <v-layout row>
          <v-spacer></v-spacer>
            <v-btn
              :loading="loading3"
              :disabled="loading3"
              color="blue-grey"
              class="white--text mt-5"
              @click.native="loader = 'loading3'"
              @click="submit"
            >
             保存商品信息
              <v-icon right dark>cloud_upload</v-icon>
            </v-btn>
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
      name: "MyGoodsForm",
      data () {
        return {
          editorOption: {// 富文本编辑器配置
            placeholder: '编写商品描述信息，让客户了解你的商品'
          },
          valid: false, //数据校验
          goods:{
            categories:null,  //商品3级分类数组信息
            brandId:0, //品牌id信息
            title:'', //标题
            subTitle:'', //子标题,卖点
            spuDetail:{
              packingList:'', //包装列表
              afterService:'', //售后服务
              description: '', //商品描述
              specTemplate: '',// sku属性模板的字符串格式
              specifications:[],
            }
          },
          brandOptions:[], //品牌列表
          specifications:[],//公共规格参数模板
          specialSpecs:[], //特有规格参数模板
          count:0, //文本框的数量
          loading3:false,
          loader: null,
          //isEdit:false,
          oldData:[],
          allSpecs:[]
        }
      },
      props:{
        oldGoods:{
          type: Object
        },
        step:{
          type:Number,
          default: 1
        },
        show:{
          type:Boolean,
          default: false
        },
        isEdit:{
          type:Boolean,
          default: false
        }
      },
      watch:{
        'goods.categories':{
          deep:true,
          handler(val){
            //判断商品分类是否存在，存在才查询
            if(val && val.length > 0) {
              //根据分类查询品牌
              this.$http.get("/item/brand/cid/" + this.goods.categories[2].id).then(({data}) => {
                this.brandOptions = data;
              }).catch();
              //根据分类查询规格参数模板
              this.$http.get("/item/spec/" + this.goods.categories[2].id).then(({data}) => {
                //保存全部规格，新增商品时使用
                this.allSpecs = data;
                this.dataProces(data);
                //过滤出SKU属性，同时将SPU中的特有属性置空
                //如果是新增，那么调用dataProces对数据进行处理，否则调用editDtaProces对数据进行处理。
                if (this.isEdit) {
                  this.editDataProces(this.oldData);
                }
              }).catch()
            }
          }
        },
        loader () {
          const l = this.loader;
          this[l] = !this[l];

          setTimeout(() => (this[l] = false), 2000)

          this.loader = null
        },
        oldGoods:{
          deep: true,
          handler(val){
            if (val !== null && val.spuDetail !== null){
              this.goods = Object.deepCopy(val);
              this.isEdit = true;
              this.oldData = val.spuDetail.specifications;
            }else {
              this.clear();
            }
          }
        },
        show:{
          deep:true,
          handler(val){
            if (val === true && this.isEdit === false){
              this.clear();
              //步骤线初始化
              this.$emit('initStep');
            }else if (val === true && this.isEdit === true){
              //步骤线初始化
              this.$emit('initStep');
            }
          }
        }
      },
      components: {
        quillEditor
      },
      computed:{
        skus(){
            //1.过滤掉用户没有填写数据的规格参数
            const arr = this.specialSpecs.filter(s => s.selected.length > 0);
            //console.log(arr);
          /**
           * 如果是进行修改时，需要根据options的长度来判断文本框的个数
           */
           for (let i = 0;i < arr.length;i++){
              if (arr[i].options.length === 0){
                this.count = arr[i].selected.length-1;
              }
           }
            //2.通过reduce进行累加笛卡儿积
            //3.数据优化：价格、库存、是否启用、商品的图片、分类组合索引
            return arr.reduce((last, spec, index) => {
              const result = [];
              last.forEach(o => {
                for (let i = 0; i < spec.selected.length; i++) {
                  const option = spec.selected[i];
                  const obj = {};
                  Object.assign(obj, o);
                  obj[spec.k] = option;
                  //拼接当前这个特有属性的索引
                  obj.indexes = (o.indexes || '') + '_' + i;
                  if (index === arr.length - 1) {
                    //如果发现是最后一组，则添加价格、库存等字段
                    const {indexes, ...rest} = obj;
                    if (this.isEdit){
                      const skuList = this.goods.skusList;
                      for (let i = 0 ; i < skuList.length ; i++){
                          if (Object.is(JSON.stringify(rest),skuList[i].ownSpec)){

                            let tempImage = [];
                            if (skuList[i].images.search(',') !== -1){
                              tempImage = skuList[i].images.split(',');
                            }else {
                              tempImage.push(skuList[i].images);
                            }
                            Object.assign(obj, {price: this.$format(skuList[i].price), stock: skuList[i].stock, enable:skuList[i].enable , images: tempImage});
                            break;
                          }else {
                            //如果已经启用，回显源数据，否则，正常构造
                            Object.assign(obj, {price: 0, stock: 0, enable: false, images: []});
                          }
                        }
                    }
                    else {
                      Object.assign(obj, {price: 0, stock: 0, enable: false, images: []});
                    }
                    //去掉索引字符串开头的下划线
                    obj.indexes = obj.indexes.substring(1);
                  }
                  result.push(obj);
                }
              });
              return result;
            }, [{}]);
        },
        headers(){
          if(this.skus.length <= 0){
            return [];
          }
          const headers = [];
          Object.keys(this.skus[0]).forEach(k =>{
             let value = k;
             if (k === 'price'){
               k = "价格";
             }else if(k === 'stock'){
               k = "库存";
             }else if(k === 'enable'){
               k = "是否启用"
             }else if(k === 'indexes' || k === 'images'){
               return ;
             }
             headers.push({
               text:k,
               align:"center",
               sortable:false,
               value
             })
          });
          return headers;
        },
        skusLength(){
          if (Object.values(this.skus[0]).length > this.specialSpecs.length+4)
            return this.skus.length;
          else return 0;
        }
      },
      methods:{
        //新增商品时数据处理
        dataProces(temp){
          let commonTemplate = [];
          let specialTemplate = [];
          let count = 0;
          temp.forEach(({params}) => {
            params.forEach(({k, options, global}) => {
              if (!global) {
                specialTemplate.push({
                  k, options, selected: []
                })
              }
            })
          });

          for (let i=0;i<temp.length;i++){
            if (temp[i].params.length > 0){
              let temp2 = temp[i].params;
              let param = [];
              for (let j = 0;j < temp2.length; j++){
                if (temp2[j].global){
                  param.push(temp2[j]);
                }
              }
              if (count !== temp2.length && param.length !== 0) {
                commonTemplate.push({
                  group: temp[i].group,
                  params: param,
                });
              }
            }
          }

          this.specialSpecs = specialTemplate;
          this.specifications = commonTemplate;
        },
        //修改商品时数据处理
        editDataProces(temp){
          /**
           * 特殊属性数据处理
           * 将用户选择的相关信息显示到对应区域
           * @type {Array}
           */
          //console.log(temp);
          const editSpecialTemplate = [];
            temp.forEach(({params}) => {
              params.forEach(({k, v,options,global}) => {
                //要进行测试，特有属性不是数组！！！！！！
                if (!global) {
                  if (options === null) {
                    editSpecialTemplate.push({
                      k, v
                    })
                  }
                  else {
                    editSpecialTemplate.push({
                      k, selected:options
                    })
                  }
                }
              })
            });
            for (let i = 0;i < editSpecialTemplate.length;i++){
              for (let j = 0;j < this.specialSpecs.length;j++){
                if (editSpecialTemplate[i].k === this.specialSpecs[j].k){
                  this.specialSpecs[i].selected = editSpecialTemplate[j].selected;
                }
              }
            }
          const editCommonTemplate = [];
          let count = 0;
          for (let i=0;i<temp.length;i++){
            if (temp[i].params.length > 0){
              let temp2 = temp[i].params;
              let param = [];
              for (let j = 0;j < temp2.length; j++){
                if (temp2[j].global){
                  param.push(temp2[j]);
                }
              }
              if (count !== temp2.length && param.length !== 0) {
                editCommonTemplate.push({
                  group: temp[i].group,
                  params: param,
                });
              }
            }
          }

          this.specifications.forEach(({group,params}) => {
              editCommonTemplate.forEach(s => {
                if (s.group === group){
                  s.params.forEach(({k,v}) => {
                    params.forEach(t => {
                      if (t.k === k){
                        t.v = v;
                      }
                    })
                  })
                }
              })
          })
        },
        submit(){
          //1.先处理goods，用结构表达式接收，除了categories外，都接收到goodsParams中
          const {categories: [{id:cid1},{id:cid2},{id:cid3}], ...goodsParams} = this.goods;
          //2.处理全部规格参数
          //目前specifications中只有公共属性的值，要把特有属性的值加上，一起存入数据库

          this.allSpecs.forEach(({group,params}) => {
            const special = this.specialSpecs;
            params.forEach(s => {
              if (!s.global){
                //如果是特殊属性，那么从specialSpecs中获取selected的值赋值给option
                special.forEach(t => {
                  if (t.k === s.k){
                    s.options = t.selected
                  }
                })
              }
            })
          });
          //去掉公共属性中的options
          const specs = this.allSpecs.map(({group,params}) => {
            const newParams = params.map(s => {
              if (s.global) {
                let {options, ...rest} = s;
                return rest;
              }else {
                return s;
              }
            });
            return {group,params:newParams}
          });
          //3.处理特有规格参数模板
          const specTemplate = {};
          this.specialSpecs.forEach(({k,selected}) => {
            specTemplate[k] = selected;
          });
          //4.处理sku
          // console.log("修改");
          // console.log(this.skus);
          const skus = this.skus.filter(s => s.enable).map(({price,stock,enable,images,indexes, ...rest}) => {
            //标题，在spu的title基础上，拼接特有规格属性值(内存、机身存储、机身颜色)
            const title = goodsParams.title+" "+Object.values(rest).join(" ");
            return {
              price: this.$format(price+""),enable,indexes,title, //基本属性
              stock: stock,
              images: images && images.length > 0 ? images.join(",") : "", //图片
              ownSpec:JSON.stringify(rest),  //特有规格参数
            }
          });
          Object.assign(goodsParams,{
            cid1,cid2,cid3, //商品分类
            skus,
          });
          goodsParams.spuDetail.specifications = JSON.stringify(specs);
          goodsParams.spuDetail.specTemplate = JSON.stringify(specTemplate);
          console.log(goodsParams);


          this.$http({
            url:"/item/goods",
            method: this.isEdit ? 'put':'post',
            data:goodsParams
          }).then(() => {
              //成功，关闭窗口
              setTimeout(() =>{
                this.$emit('close');
                this.$message.success("保存成功！");
                this.clear();
              },2000);
          }).catch(() => {
            this.$message.error("保存失败！");
          });
        },
        clear(){
          //清空表单
          //this.oldGoods = {};
          this.goods.categories = [];
          this.goods.brandId = 0;
          this.goods.title = '';
          this.goods.subTitle = '';
          this.goods.spuDetail.packingList = '';
          this.goods.spuDetail.afterService = '';
          this.goods.spuDetail.description = '';
          this.brandOptions = [];//品牌列表
          this.specifications = [];//规格参数模板
          this.specialSpecs = []; //特有规格参数模板
        }
      }
    }
</script>

<style scoped>
  @-moz-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @-webkit-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @-o-keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes loader {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
