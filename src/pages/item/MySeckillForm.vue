<template>
  <v-form  ref="SeckillForm">
      <v-container grid-list-md>
        <v-layout column wrap>
          <v-flex xs12 lg6>
            <v-layout row>
              <v-text-field
                readonly
                label="商品编号"
                prepend-icon="label"
                style="width: 50px"
                v-model="goods_message.goodsId"
              ></v-text-field>
              <v-text-field
                readonly
                label="商品名称"
                prepend-icon="label"
                style="width: 100px"
                v-model="goods_message.goodsTitle"
              ></v-text-field>
              <v-text-field
                readonly
                label="商品分类"
                prepend-icon="label"
                style="width: 100px"
                v-model="goods_message.goodsCname"
              ></v-text-field>
              <v-text-field
                readonly
                label="品牌"
                prepend-icon="label"
                style="width: 100px"
                v-model="goods_message.goodsBname"
              ></v-text-field>
            </v-layout>
            <v-layout row>
              <v-layout row>
                <v-menu
                  ref="menu1"
                  :close-on-content-click="false"
                  v-model="menu1"
                  :nudge-right="40"
                  lazy
                  transition="scale-transition"
                  offset-y
                  full-width
                  max-width="290px"
                  min-width="290px"
                >
                  <v-text-field
                    slot="activator"
                    v-model="dateFormatted"
                    label="开始日期"
                    prepend-icon="event"
                    persistent-hint
                    readonly
                    @blur="date = parseDate(dateFormatted)"
                  ></v-text-field>
                  <v-date-picker locale="zh-cn" v-model="date" no-title @input="menu1 = false"></v-date-picker>
                </v-menu>
                <v-dialog
                  ref="dialog1"
                  v-model="modal1"
                  :return-value.sync="time1"
                  persistent
                  lazy
                  full-width
                  width="290px"
                >
                  <v-text-field
                    slot="activator"
                    v-model="time1"
                    label="开始时间"
                    prepend-icon="access_time"
                    readonly
                  ></v-text-field>
                  <v-time-picker
                    v-if="modal1"
                    v-model="time1"
                    full-width
                  >
                    <v-spacer></v-spacer>
                    <v-btn flat color="primary" @click="modal1 = false">Cancel</v-btn>
                    <v-btn flat color="primary" @click="$refs.dialog1.save(time1)">OK</v-btn>
                  </v-time-picker>
                </v-dialog>
              </v-layout>
              <v-layout row>
                <v-menu
                  :close-on-content-click="false"
                  v-model="menu2"
                  :nudge-right="40"
                  lazy
                  transition="scale-transition"
                  offset-y
                  full-width
                  max-width="390px"
                  min-width="390px"
                >
                  <v-text-field
                    slot="activator"
                    v-model="dateFormatted2"
                    label="结束日期"
                    prepend-icon="event"
                    persistent-hint
                    readonly
                    @blur="date2 = parseDate(dateFormatted2)"
                  ></v-text-field>
                  <v-date-picker locale="zh-cn" v-model="date2" no-title @input="menu2 = false"></v-date-picker>
                </v-menu>
                <v-dialog
                  ref="dialog2"
                  v-model="modal2"
                  :return-value.sync="time2"
                  persistent
                  lazy
                  full-width
                  width="290px"
                >
                  <v-text-field
                    slot="activator"
                    v-model="time2"
                    label="结束时间"
                    prepend-icon="access_time"
                    readonly
                  ></v-text-field>
                  <v-time-picker
                    v-if="modal2"
                    v-model="time2"
                    full-width
                  >
                    <v-spacer></v-spacer>
                    <v-btn flat color="primary" @click="modal2 = false">Cancel</v-btn>
                    <v-btn flat color="primary" @click="$refs.dialog2.save(time2)">OK</v-btn>
                  </v-time-picker>
                </v-dialog>
              </v-layout>
            </v-layout>
          </v-flex>
          <v-flex xs12 lg6>
            <v-data-table
              :headers="headers"
              :items="sku"
              class="elevation-1"
              hide-actions
            >
              <template v-if="props.item.enable === false" slot="items" slot-scope="props">
                <td class="text-xs-center" style="width: 150px">{{ props.item.spec }}</td>
                <td class="text-xs-center" >{{ props.item.price }}</td>
                <td class="text-xs-center">{{ props.item.stock }}</td>
                <td class="text-xs-center">
                  <v-select
                  :items="items"
                  item-text="dis"
                  item-value="value"
                  v-model="props.item.discount"
                ></v-select></td>
                <td class="text-xs-center">
                  <v-text-field
                    label="数量"
                    v-model="props.item.seckill_count"
                  ></v-text-field>
                </td>
                <td class="text-xs-center">
                  <v-checkbox color="primary"  v-model="props.item.enable"/>
                </td>
              </template>
            </v-data-table>
          </v-flex>
        </v-layout>
      </v-container>
    <v-layout class="pt-3" >
      <v-spacer></v-spacer>
      <v-btn color="blue darken-1" flat @click="clear">清空</v-btn>
      <v-btn color="blue darken-1" flat @click="submit">保存</v-btn>
    </v-layout>
  </v-form>
</template>

<script>
  export default {
    name: "MySeckillForm",
    data: vm => ({
      headers: [
        { text: '规格属性', value: 'spec', align:"center", sortable:false},
        { text: '价格', value: 'price' , align:"center", sortable:false},
        { text: '现有库存', value: 'stock' , align:"center", sortable:false},
        { text: '折扣', align:"center", sortable:false},
        { text: '秒杀数量' , align:"center", sortable:false},
        { text: '是否秒杀' , align:"center", sortable:false}
      ],
      goods_count:'',
      date: new Date().toISOString().substr(0, 10),
      date2: new Date().toISOString().substr(0, 10),
      dateFormatted: vm.formatDate(new Date().toISOString().substr(0, 10)),
      dateFormatted2: vm.formatDate(new Date().toISOString().substr(0, 10)),
      menu1: false,
      menu2: false,
      time1: null,
      modal1: false,
      time2: null,
      modal2: false,
      items: [
        {dis:'一折',value:0.1},
        {dis:'二折',value:0.2},
        {dis:'三折',value:0.3},
        {dis:'四折',value:0.4},
        {dis:'五折',value:0.5},
        {dis:'六折',value:0.6},
        {dis:'七折',value:0.7},
        {dis:'八折',value:0.8},
      ],
      goods_message:{}, //秒杀商品信息
      skus:[],
      sku_temp:[],
    }),
    props:{
      seckill_goods_message:{type:Object},
    },
    computed:{
      sku:{
        // getter
        get: function () {
          let temp = [];
          this.skus.forEach(sku => {
            const ownSpec = JSON.parse(sku.ownSpec);
            let str = "";
            for (let key in ownSpec){
              str += (" " + ownSpec[key])
            }
            temp.push({
              id:sku.id,
              spec:str,
              price:this.$format(sku.price),
              stock:sku.stock,
              enable:false,
            })
          });
          return temp;
        },
        // setter
        set: function (newValue) {

        }
      }
    },
    watch: {
      seckill_goods_message:{
        deep:true,
        handler(val){
          console.log(val);
          if(val){
            this.goods_message = Object.deepCopy(val);
            this.loadData(this.goods_message.goodsId);
          }else{
            this.clear();
          }
        }
      },
      date (val) {
        this.dateFormatted = this.formatDate(this.date)
      },
      date2 (val) {
        this.dateFormatted2 = this.formatDate(this.date2)
        if (this.date2 < this.date){
          this.$message.confirm("结束日期必须大于开始日期！").then(() => {
            this.date2 = null;
          }).catch(() => {
            this.date2 = null;
          });
        }
      },
    },
    created(){
      let temp = [];
      this.skus.forEach(sku => {
        const ownSpec = JSON.parse(sku.ownSpec);
        let str = "";
        for (let key in ownSpec){
          str += (" " + ownSpec[key])
        }
        temp.push({
          id:sku.id,
          spec:str,
          price:this.$format(sku.price),
          stock:sku.stock,
          enable:false,
        })
      });
      this.sku_temp = temp;
      this.clear();
    },
    methods: {
      loadData(id){
        //查询spu下的所有sku
        this.$http.get("/item/goods/sku/list/" + id).then((resp) => {
          this.skus = resp.data;
        }).catch();
      },
      formatDate (date) {
        if (!date) return null;

        const [year, month, day] = date.split('-');
        return `${year}年${month}月${day}日`
      },
      parseDate (date) {
        if (!date) return null;

        const [month, day, year] = date.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      },
      clear(){
        this.goods_count = null;
        this.date = null;
        this.date2 = null;
        this.time1 = null;
        this.time2 = null;
        this.discount = null;
      },
      submit(){
        const startTime = this.date +" " + this.time1;
        const endTime = this.date2 +" " + this.time2;
        let result = [];
        this.sku.forEach(temp => {
          if (temp.enable){
            result.push({
              startTime:startTime,
              endTime:endTime,
              id:temp.id,
              count:parseInt(temp.seckill_count),
              discount:temp.discount
            });
          }
        });
        this.verify().then(() => {
          this.$http({
            url:"/item/goods/seckill/add",
            method:"post",
            headers : {
              'Content-Type' : 'application/json;charset=utf-8'
            },
            dataType:"json",
            data:JSON.stringify(result)
          }).then(() =>{
            //添加成功
            setTimeout(() =>{
              this.$emit('seckill_close');
              this.$message.success("保存成功！");
              this.clear();
            },2000);

          }).catch(() => {
            this.$message.error("添加失败！");
          });
        }).catch(() => {
          this.$router.push("/login");
        });
      }
    }
  }
</script>

<style scoped>

</style>
