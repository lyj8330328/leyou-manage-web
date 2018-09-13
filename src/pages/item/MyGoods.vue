<template>
  <v-card>
    <v-card-title>
      <v-btn color="primary" @click="addGoods">新增商品</v-btn>
      <v-btn color="error" @click="deleteAllGoods">全部删除</v-btn>
      <v-btn color="secondary" @click="soldOutPutAll" v-if="filter.saleable === false">全部上架</v-btn>
      <v-btn color="secondary" @click="soldOutPutAll" v-else>全部下架</v-btn>
      <v-spacer></v-spacer>
      <v-flex xs3>
        状态：
        <v-btn-toggle v-model="filter.saleable">
          <!--<v-btn flat>-->
            <!--全部-->
          <!--</v-btn>-->
          <v-btn flat :value="true">
            上架
          </v-btn>
          <v-btn flat :value="false">
            下架
          </v-btn>
        </v-btn-toggle>
      </v-flex>
      <v-text-field label="输入关键字搜索" class="flex sm3"  append-icon="search" v-model.lazy="filter.search"></v-text-field>
    </v-card-title>
    <v-divider></v-divider>
    <v-data-table
      :headers="headers"
      :items="goodsList"
      :pagination.sync="pagination"
      :total-items="totalGoods"
      :loading="loading"
      class="elevation-10"
      select-all
      v-model="selected"
    >
      <template slot="items" slot-scope="props">
        <td class="text-xs-center">
          <v-checkbox v-model="props.selected" primary hide-details>

          </v-checkbox>
        </td>
        <td class="text-xs-center">{{ props.item.id }}</td>
        <td class="text-xs-center">{{ props.item.title }}</td>
        <td class="text-xs-center">{{ props.item.cname}}</td>
        <td class="text-xs-center">{{ props.item.bname }}</td>
        <td class="justify-center layout">
          <v-btn icon small @click="editGoods(props.item)">
            <i class="el-icon-edit"/>
          </v-btn>
          <v-btn icon small @click="deleteItem(props.item.id)">
            <i class="el-icon-delete"/>
          </v-btn>
          <v-btn icon small v-if="props.item.saleable" @click="soldOutPut(props.item.id)">下架</v-btn>
          <v-btn icon small v-else @click="soldOutPut(props.item.id)">上架</v-btn>
        </td>
      </template>
      <template slot="no-data">
        <v-alert :value="true" color="error" icon="warning">
          对不起，没有查询到任何数据 :(
        </v-alert>
      </template>
      <template slot="pageText" slot-scope="props">
        共{{props.itemsLength}}条,当前:{{ props.pageStart }} - {{ props.pageStop }}
      </template>
    </v-data-table>

    <v-dialog max-width="900" v-model="show" persistent scrollable>
      <v-card>
        <!--对话框的标题-->
        <v-toolbar dense dark color="primary">
          <v-toolbar-title>{{isEdit ? '修改' : '新增'}}商品</v-toolbar-title>
          <v-spacer/>
          <!--关闭窗口的按钮-->
          <v-btn icon @click="closeWindow"><v-icon>close</v-icon></v-btn>
        </v-toolbar>
        <!--对话框的内容，表单-->
        <v-card-text class="px-5" style="height: 600px">
          <my-goods-form @initStep="initStep" @close="close" :isEdit="isEdit" :oldGoods="oldGoods" :step="step" :show="show"  ref="goodsForm"/>
        </v-card-text>
        <v-card-actions>
          <v-layout row justify-center>
            <v-flex xs2>
              <v-btn :disabled="step === 1" color="primary" @click="lastStep">上一步</v-btn>
            </v-flex>
            <v-flex xs2>
              <v-btn :disabled="step === 4" color="primary" @click="nextStep">下一步</v-btn>
            </v-flex>
          </v-layout>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
  // 导入自定义的表单组件
    import MyGoodsForm from './MyGoodsForm'

    export default {
      name: "MyGoods",
      data(){
          return{
            totalGoods:0, //总条数
            goodsList: [], //当前页品牌数据
            loading: true, //是否在加载中
            headers: [// 表头
              {text: 'id', align: 'center', value: 'id',sortable: true},
              {text: '标题', align: 'center', sortable: false, value: 'name'},
              {text: '商品分类', align: 'center', sortable: false, value: 'category'},
              {text: '品牌', align: 'center', value: 'brand', sortable: false,},
              {text: '操作', align: 'center', sortable: false}
            ],
            show: false, //控制对话框的显示
            oldGoods : {}, //即将编辑的商品信息
            isEdit : false, //是否被编辑
            selected:[], //选择的条目
            pagination:{}, //分页信息
            filter :{
              saleable: true, //上架还是下架
              search: '',  //搜索过滤字段
            },
            step:1, //子组件中的步骤索引，初始为1
          }
        },
      watch:{
        pagination:{
          deep:true,
          handler(){
            this.getDataFromServer();
          }
        },
        filter:{
          deep:true,
          handler(){
            this.getDataFromServer();
          }
        }
      },
      created(){
        this.getDataFromServer();
      },
      methods:{
        close(){
          this.show = false;
          //重新获取数据
          this.getDataFromServer();
          //初始化弹窗
          this.step = 1;
        },
        initStep(){
          this.step = 1;
        },
        getDataFromServer(){ //从服务器加载数据

          // 开启进度条
          this.loading = true;

          //发起ajax请求
          // 分页查询page,rows,key,sortBy,desc

          this.$http.get("/item/goods/spu/page",{
            params:{
              page:this.pagination.page, //当前页
              rows:this.pagination.rowsPerPage, //每页大小
              sortBy:this.pagination.sortBy,  //排序字段
              desc:this.pagination.descending, //是否降序
              key:this.filter.search, //搜索条件
              saleable:this.filter.saleable ===0 ? true: this.filter.saleable//上下架
            }
          }).then(resp =>{
            console.log(resp.data.items)
            this.goodsList=resp.data.items;
            this.totalGoods = resp.data.total;
            //关闭进度条
            this.loading = false;
          })

        },
        addGoods(){
          //修改标记
          this.isEdit = false;
          //控制弹窗可见
          this.show = true;
          //把oldGoods变为null
          this.oldGoods = null;
        },
        deleteAllGoods(){

          const deleteGoodsId = this.selected.map(s => {
            return s.id;
          });

          if (deleteGoodsId.length > 0){
            this.$message.confirm("全部删除，不可恢复！").then(() => {
              this.$http.delete("/item/goods/spu/"+deleteGoodsId.join("-")).then(() => {
                this.getDataFromServer();
                this.selected = [];
              }).catch(() => {
                this.$message.error("删除失败！");
              })
            }).catch(() => {
              this.$message.info("删除取消！");
            })
          }else {
            this.$message.info("选中后再进行操作！");
          }
        },
        closeWindow(){
          this.oldGoods = null;
          //重新加载数据
          this.getDataFromServer();
          //关闭窗口
          this.show = false;
        },
        lastStep(){
          if (this.step > 1){
            this.step--;
          }
        },
        nextStep(){
          if (this.$refs.goodsForm.$refs.basic.validate() && this.step < 4)
          {
            this.step++;
          }
        },
        deleteItem(id){
          const selectId = this.selected.map( s => {
            return s.id;
          });
          if (selectId.length === 1 && selectId[0] === id) {
            this.$message.confirm("删除后，不可恢复！").then(() => {
              this.$http.delete("/item/goods/spu/"+id).then(() => {
                this.getDataFromServer();
                this.selected = [];
              }).catch(() => {
                this.$message.error("删除失败！");
              })
            }).catch(() => {
              this.$message.info("删除取消！");
            });
          }else {
            this.$message.info("选中后再进行操作！");
          }
        },
        soldOutPut(id){
          const selectId = this.selected.map( s => {
            return s.id;
          });
          if (selectId.length === 1 && selectId[0] === id) {
            this.$http.put("/item/goods/spu/out/" + id).then(() => {
              this.$message.success("操作成功！");
              this.getDataFromServer();
              this.selected = [];
            }).catch(() => {
              this.$message.error("操作失败！");
            });
          }else {
            this.$message.info("选中后再进行操作！");
          }
        },
        editGoods(oldGoods){
          //console.log(oldGoods);
          this.oldGoods = oldGoods;
          //构造商品分类
          const cname=oldGoods.cname.split("/");
          const categories=[];
          categories.push({id:oldGoods.cid1,name:cname[0]});
          categories.push({id:oldGoods.cid2,name:cname[1]});
          categories.push({id:oldGoods.cid3,name:cname[2]});
          this.oldGoods.categories = categories;

          this.$http.get("/item/goods/spu/"+oldGoods.id).then(({data}) => {
            console.log(data);
            this.isEdit = true;
            this.oldGoods.skusList = data.skus;
            this.oldGoods.spuDetail = data.spuDetail;
            this.oldGoods.spuDetail.specTemplate = JSON.parse(data.spuDetail.specTemplate);
            this.oldGoods.spuDetail.specifications = JSON.parse(data.spuDetail.specifications);

            //显示弹窗
            this.show = true;
          }).catch();
        },
        soldOutPutAll(){

          const Ids = this.selected.map(s => {
            return s.id;
          });

          if (Ids.length > 0){
            this.$message.confirm(this.filter.saleable?"全部下架,，不可恢复！":"全部上架,，不可恢复！").then(() => {
              this.$http.put("/item/goods/spu/out/"+Ids.join("-")).then(() => {
                this.getDataFromServer();
                this.selected = [];
              }).catch(() => {
                this.$message.error(this.filter.saleable?"下架失败！":"上架失败！");
              })
            }).catch(() => {
              this.$message.info(this.filter.saleable?"下架取消！":"上架取消！");
            })
          }else {
            this.$message.info("选中后再进行操作！");
          }
        }
      },
      components:{
        MyGoodsForm
      }
    }
</script>

<style scoped>

</style>
